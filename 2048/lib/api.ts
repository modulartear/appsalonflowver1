import { supabase } from './supabase';
import { Salon, Appointment, Service, Stylist, PaymentMethod, Promotion } from './types';
import bcrypt from 'bcryptjs';

// ============================================
// SALON OPERATIONS
// ============================================

export const saveSalon = async (salon: Omit<Salon, 'id'>): Promise<Salon | null> => {
  try {
    // Hash password antes de guardar
    const passwordHash = await bcrypt.hash(salon.password, 10);
    
    // Calcular trial_end_date basado en el plan
    const planStartDate = new Date(salon.planStartDate);
    const trialDays = salon.plan === 'free' ? 15 : 30;
    const trialEndDate = new Date(planStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    
    const { data, error } = await supabase
      .from('salons')
      .insert([{
        name: salon.name,
        owner_name: salon.ownerName,
        email: salon.email,
        password_hash: passwordHash,
        phone: salon.phone,
        address: salon.address,
        description: salon.description || null,
        plan: salon.plan,
        plan_start_date: salon.planStartDate,
        is_active: true,
        trial_end_date: trialEndDate.toISOString(),
        week_schedule: salon.weekSchedule || null, // Guardar horarios por día
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving salon:', error);
      return null;
    }

    // Convertir de formato DB a formato App
    return dbSalonToAppSalon(data);
  } catch (error) {
    console.error('Error in saveSalon:', error);
    return null;
  }
};

export const getSalons = async (): Promise<Salon[]> => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting salons:', error);
      return [];
    }

    return data.map(dbSalonToAppSalon);
  } catch (error) {
    console.error('Error in getSalons:', error);
    return [];
  }
};

// Alias para el dashboard de admin
export const getAllSalons = getSalons;

export const getSalonById = async (id: string): Promise<Salon | null> => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting salon:', error);
      return null;
    }

    // Obtener servicios, estilistas, métodos de pago y promociones
    const [services, stylists, paymentMethods, promotions] = await Promise.all([
      getServicesBySalonId(id),
      getStylistsBySalonId(id),
      getPaymentMethodsBySalonId(id),
      getPromotionsBySalonId(id),
    ]);

    const salon = dbSalonToAppSalon(data);
    salon.services = services;
    salon.stylists = stylists;
    salon.paymentMethods = paymentMethods;
    salon.promotions = promotions;

    return salon;
  } catch (error) {
    console.error('Error in getSalonById:', error);
    return null;
  }
};

export const getSalonByEmail = async (email: string): Promise<Salon | null> => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error getting salon by email:', error);
      return null;
    }
    if (!data) {
      return null;
    }

    return dbSalonToAppSalon(data);
  } catch (error) {
    console.error('Error in getSalonByEmail:', error);
    return null;
  }
};

export const updateSalon = async (id: string, updatedData: Partial<Salon>): Promise<boolean> => {
  try {
    const updatePayload: any = {};
    
    if (updatedData.name) updatePayload.name = updatedData.name;
    if (updatedData.ownerName) updatePayload.owner_name = updatedData.ownerName;
    if (updatedData.phone) updatePayload.phone = updatedData.phone;
    if (updatedData.address) updatePayload.address = updatedData.address;
    if (updatedData.description !== undefined) updatePayload.description = updatedData.description;
    if (updatedData.plan) updatePayload.plan = updatedData.plan;
    if (updatedData.weekSchedule !== undefined) updatePayload.week_schedule = updatedData.weekSchedule; // Actualizar horarios

    const { error } = await supabase
      .from('salons')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Error updating salon:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSalon:', error);
    return false;
  }
};

export const updateSalonPlan = async (salonId: string, plan: 'free' | 'pro'): Promise<boolean> => {
  try {
    // First, check if the salon exists to avoid updating a non-existent record.
    const { data: salon, error: fetchError } = await supabase
      .from('salons')
      .select('id')
      .eq('id', salonId)
      .single();

    if (fetchError || !salon) {
      console.error(`Error fetching salon or salon not found: ${salonId}`, fetchError);
      // Special case for 'new-pro-salon' which is a placeholder and doesn't exist yet.
      // In a real scenario, you would create the salon first or handle this differently.
      if (salonId === 'new-pro-salon') {
        console.log("Webhook received for 'new-pro-salon'. Skipping DB update as it's a placeholder.");
        return true; // Pretend it was successful for the demo flow.
      }
      return false;
    }

    // Calcular nueva fecha de fin del período
    const planStartDate = new Date();
    const trialDays = plan === 'free' ? 15 : 30;
    const trialEndDate = new Date(planStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    const { error } = await supabase
      .from('salons')
      .update({ 
        plan: plan, 
        plan_start_date: planStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        is_active: true // Reactivar el salón al actualizar el plan
      })
      .eq('id', salonId);

    if (error) {
      console.error('Error updating salon plan:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSalonPlan:', error);
    return false;
  }
};

export const validateSalonCredentials = async (email: string, password: string): Promise<Salon | null> => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    // Verificar password
    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return null;
    }

    return dbSalonToAppSalon(data);
  } catch (error) {
    console.error('Error in validateSalonCredentials:', error);
    return null;
  }
};

// ============================================
// SERVICE OPERATIONS
// ============================================

export const getServicesBySalonId = async (salonId: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting services:', error);
      return [];
    }

    return data.map(dbServiceToAppService);
  } catch (error) {
    console.error('Error in getServicesBySalonId:', error);
    return [];
  }
};

export const saveServices = async (salonId: string, services: Service[]): Promise<boolean> => {
  try {
    // Eliminar servicios existentes
    await supabase.from('services').delete().eq('salon_id', salonId);

    // Insertar nuevos servicios
    const servicesToInsert = services.map(service => ({
      salon_id: salonId,
      id: service.id,
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || null,
      active: service.active,
    }));

    const { error } = await supabase
      .from('services')
      .insert(servicesToInsert);

    if (error) {
      console.error('Error saving services:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveServices:', error);
    return false;
  }
};

// ============================================
// STYLIST OPERATIONS
// ============================================

export const getStylistsBySalonId = async (salonId: string): Promise<Stylist[]> => {
  try {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting stylists:', error);
      return [];
    }

    return data.map(dbStylistToAppStylist);
  } catch (error) {
    console.error('Error in getStylistsBySalonId:', error);
    return [];
  }
};

export const saveStylists = async (salonId: string, stylists: Stylist[]): Promise<boolean> => {
  try {
    // Eliminar estilistas existentes
    await supabase.from('stylists').delete().eq('salon_id', salonId);

    // Insertar nuevos estilistas
    const stylistsToInsert = stylists.map(stylist => ({
      salon_id: salonId,
      id: stylist.id,
      name: stylist.name,
      specialties: stylist.specialties,
      photo: stylist.photo || null,
      active: stylist.active,
    }));

    const { error } = await supabase
      .from('stylists')
      .insert(stylistsToInsert);

    if (error) {
      console.error('Error saving stylists:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveStylists:', error);
    return false;
  }
};

// ============================================
// PAYMENT METHOD OPERATIONS
// ============================================

export const getPaymentMethodsBySalonId = async (salonId: string): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }

    return data.map(dbPaymentMethodToAppPaymentMethod);
  } catch (error) {
    console.error('Error in getPaymentMethodsBySalonId:', error);
    return [];
  }
};

export const savePaymentMethods = async (salonId: string, methods: PaymentMethod[]): Promise<boolean> => {
  try {
    // Eliminar métodos existentes
    await supabase.from('payment_methods').delete().eq('salon_id', salonId);

    // Insertar nuevos métodos
    const methodsToInsert = methods.map(method => ({
      salon_id: salonId,
      id: method.id,
      type: method.type,
      name: method.name,
      details: method.details || null,
      token: method.token || null,
      account_info: method.accountInfo || null,
      active: method.active,
    }));

    const { error } = await supabase
      .from('payment_methods')
      .insert(methodsToInsert);

    if (error) {
      console.error('Error saving payment methods:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in savePaymentMethods:', error);
    return false;
  }
};

// ============================================
// PROMOTION OPERATIONS
// ============================================

export const getPromotionsBySalonId = async (salonId: string): Promise<Promotion[]> => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting promotions:', error);
      return [];
    }

    return data.map(dbPromotionToAppPromotion);
  } catch (error) {
    console.error('Error in getPromotionsBySalonId:', error);
    return [];
  }
};

export const savePromotions = async (salonId: string, promotions: Promotion[]): Promise<boolean> => {
  try {
    // Eliminar promociones existentes
    await supabase.from('promotions').delete().eq('salon_id', salonId);

    // Insertar nuevas promociones
    const promotionsToInsert = promotions.map(promo => ({
      salon_id: salonId,
      id: promo.id,
      type: promo.type,
      name: promo.name,
      discount: promo.discount,
      service_ids: promo.serviceIds || null,
      days: promo.days || null,
      active: promo.active,
    }));

    const { error } = await supabase
      .from('promotions')
      .insert(promotionsToInsert);

    if (error) {
      console.error('Error saving promotions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in savePromotions:', error);
    return false;
  }
};

// ============================================
// APPOINTMENT OPERATIONS
// ============================================

export const saveAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        salon_id: appointment.salonId,
        client_name: appointment.clientName,
        client_email: appointment.clientEmail,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        notes: appointment.notes || null,
        payment_method: appointment.paymentMethod || null,
        promotion: appointment.promotion || null,
        discount: appointment.discount || null,
        original_price: appointment.originalPrice || null,
        final_price: appointment.finalPrice || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving appointment:', error);
      return null;
    }

    return dbAppointmentToAppAppointment(data);
  } catch (error) {
    console.error('Error in saveAppointment:', error);
    return null;
  }
};

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Error getting appointments:', error);
      return [];
    }

    return data.map(dbAppointmentToAppAppointment);
  } catch (error) {
    console.error('Error in getAppointments:', error);
    return [];
  }
};

export const getAppointmentsBySalonId = async (salonId: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Error getting appointments:', error);
      return [];
    }

    return data.map(dbAppointmentToAppAppointment);
  } catch (error) {
    console.error('Error in getAppointmentsBySalonId:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    return false;
  }
};

// ============================================
// HELPER FUNCTIONS - Conversión DB <-> App
// ============================================

function dbSalonToAppSalon(dbSalon: any): Salon {
  return {
    id: dbSalon.id,
    name: dbSalon.name,
    ownerName: dbSalon.owner_name,
    email: dbSalon.email,
    password: dbSalon.password_hash,
    phone: dbSalon.phone,
    address: dbSalon.address,
    description: dbSalon.description || '',
    services: [],
    plan: dbSalon.plan,
    planStartDate: dbSalon.plan_start_date,
    isActive: dbSalon.is_active !== undefined ? dbSalon.is_active : true,
    trialEndDate: dbSalon.trial_end_date || null,
    weekSchedule: dbSalon.week_schedule || [], // Mapear horarios por día
    stylists: [],
    paymentMethods: [],
    promotions: [],
  };
}

function dbServiceToAppService(dbService: any): Service {
  return {
    id: dbService.id,
    name: dbService.name,
    duration: dbService.duration,
    price: dbService.price,
    description: dbService.description || '',
    active: dbService.active,
  };
}

function dbStylistToAppStylist(dbStylist: any): Stylist {
  return {
    id: dbStylist.id,
    name: dbStylist.name,
    specialties: dbStylist.specialties || [],
    photo: dbStylist.photo || '',
    active: dbStylist.active,
  };
}

function dbPaymentMethodToAppPaymentMethod(dbMethod: any): PaymentMethod {
  return {
    id: dbMethod.id,
    type: dbMethod.type,
    name: dbMethod.name,
    details: dbMethod.details || '',
    token: dbMethod.token || '',
    accountInfo: dbMethod.account_info || '',
    active: dbMethod.active,
  };
}

function dbPromotionToAppPromotion(dbPromo: any): Promotion {
  return {
    id: dbPromo.id,
    type: dbPromo.type,
    name: dbPromo.name,
    discount: dbPromo.discount,
    serviceIds: dbPromo.service_ids || [],
    days: dbPromo.days || [],
    active: dbPromo.active,
  };
}

function dbAppointmentToAppAppointment(dbAppt: any): Appointment {
  return {
    id: dbAppt.id,
    salonId: dbAppt.salon_id,
    clientName: dbAppt.client_name,
    clientEmail: dbAppt.client_email,
    clientPhone: dbAppt.client_phone,
    service: dbAppt.service,
    date: dbAppt.date,
    time: dbAppt.time,
    status: dbAppt.status,
    notes: dbAppt.notes || '',
    paymentMethod: dbAppt.payment_method || '',
    promotion: dbAppt.promotion || '',
    discount: dbAppt.discount || 0,
    originalPrice: dbAppt.original_price || 0,
    finalPrice: dbAppt.final_price || 0,
    createdAt: dbAppt.created_at,
  };
}
