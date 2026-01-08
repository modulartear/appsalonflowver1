export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  active: boolean;
}

export interface Promotion {
  id: string;
  type: 'service' | 'day';
  discount: number; // percentage
  serviceIds?: string[]; // for service-based promotions
  days?: number[]; // 0-6 (Sunday-Saturday) for day-based promotions
  name: string;
  active: boolean;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  photo?: string;
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'local' | 'online';
  name: string; // e.g., "Efectivo", "Tarjeta", "Mercado Pago"
  active: boolean;
  details?: string;
  token?: string; // Token de Mercado Pago u otra plataforma (solo para online)
  accountInfo?: string; // CBU, Alias, etc. (solo para online)
}
export interface TimeSlot {
  start: string; // e.g., "08:00"
  end: string; // e.g., "13:00"
}

export interface DaySchedule {
  day: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayName: string; // "Lunes", "Martes", etc.
  isOpen: boolean; // Si el salón abre ese día
  morning?: TimeSlot; // Horario de mañana (opcional)
  afternoon?: TimeSlot; // Horario de tarde (opcional)
  // Campos legacy para compatibilidad
  start?: string; // Deprecated
  end?: string; // Deprecated
}

export interface WorkingHours {
  start: string; // e.g., "09:00" (deprecated, usar schedule)
  end: string; // e.g., "18:00" (deprecated, usar schedule)
}

export interface WeekSchedule {
  schedule: DaySchedule[]; // Horarios por cada día de la semana
}

export interface Salon {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  password: string; // Hashed password
  phone: string;
  address: string;
   city?: string;  
  description: string;
  services: Service[];
  plan: 'free' | 'pro';
  planStartDate: string; // ISO date string for when plan started
  isActive: boolean; // Si el salón tiene acceso activo
  trialEndDate?: string; // Fecha de fin del período de prueba
  promotions?: Promotion[];
  stylists?: Stylist[];
  paymentMethods?: PaymentMethod[];
  workingHours?: WorkingHours; // Deprecated
  weekSchedule?: DaySchedule[]; // Nuevo: horarios por día de la semana
}

export interface Appointment {
  id: string;
  salonId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  paymentMethod?: string;
  promotion?: string; // nombre de la promoción aplicada
  discount?: number; // porcentaje de descuento
  originalPrice?: number;
  finalPrice?: number;
  createdAt: string;
}

export interface FormData {
  [key: string]: string | string[];
}
