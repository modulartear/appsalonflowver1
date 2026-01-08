'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scissors,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  MapPin,
  Tag,
  CreditCard
} from 'lucide-react';
import { getSalonById, saveAppointment, getAppointmentsBySalonId } from '@/lib/api';
import { Salon, Appointment, Promotion } from '@/lib/types';
import { generateTimeSlots, isValidEmail, isValidPhone } from '@/lib/utils';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
    paymentMethod: '',
  });

  useEffect(() => {
    if (salonId) loadSalonData();
  }, [salonId]);

  const loadSalonData = async () => {
    const salonData = await getSalonById(salonId);
    if (salonData) {
      setSalon(salonData);
      setFormData(prev => ({ ...prev, service: salonData.services[0]?.name || '' }));
    } else {
      router.push('/client');
    }
  };

  useEffect(() => {
    if (formData.date && salon) loadBookedSlots();
  }, [formData.date, salonId, salon]);

  const loadBookedSlots = async () => {
    const appointments = await getAppointmentsBySalonId(salonId);
    const bookedTimes = appointments
      .filter(apt => apt.date === formData.date && apt.status !== 'cancelled')
      .map(apt => apt.time);
    setBookedSlots(bookedTimes);
  };

  useEffect(() => {
    if (salon && (formData.service || formData.date)) checkAvailablePromotions();
  }, [formData.service, formData.date, salon]);

  const checkAvailablePromotions = () => {
    if (!salon || !salon.promotions) return;
    const promotions: Promotion[] = [];
    const selectedDate = formData.date ? new Date(`${formData.date}T00:00:00`) : null;
    const dayOfWeek = selectedDate ? selectedDate.getDay() : undefined;

    if (formData.service) {
      const selectedService = salon.services.find(s => s.name === formData.service);
      if (selectedService) {
        const servicePromotions = salon.promotions.filter(
          promo =>
            promo.active &&
            promo.type === 'service' &&
            promo.serviceIds?.includes(selectedService.id)
        );
        promotions.push(...servicePromotions);
      }
    }

    if (dayOfWeek !== undefined) {
      const dayPromotions = salon.promotions.filter(
        promo =>
          promo.active &&
          promo.type === 'day' &&
          promo.days?.includes(dayOfWeek)
      );
      promotions.push(...dayPromotions);
    }

    const uniquePromotions = promotions.filter(
      (promo, index, self) => index === self.findIndex(p => p.id === promo.id)
    );

    if (uniquePromotions.length > 0 && !selectedPromotion) {
      setAvailablePromotions(uniquePromotions);
      setShowPromotionPopup(true);
    } else if (uniquePromotions.length === 0) {
      setAvailablePromotions([]);
      setSelectedPromotion(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getServicePrice = (): number => {
    if (!salon || !formData.service) return 0;
    const service = salon.services.find(s => s.name === formData.service);
    return service?.price || 0;
  };

  const calculateDiscountedPrice = (promotion: Promotion): number => {
    const originalPrice = getServicePrice();
    const discount = (originalPrice * promotion.discount) / 100;
    return originalPrice - discount;
  };

  const handleSelectPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowPromotionPopup(false);
  };

  const handleSkipPromotion = () => {
    setSelectedPromotion(null);
    setShowPromotionPopup(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'El nombre es requerido';
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'El email es requerido';
    } else if (!isValidEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Email inválido';
    }
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'El teléfono es requerido';
    } else if (!isValidPhone(formData.clientPhone)) {
      newErrors.clientPhone = 'Teléfono inválido (8-15 dígitos)';
    }
    if (!formData.service) newErrors.service = 'Selecciona un servicio';
    if (!formData.date) newErrors.date = 'Selecciona una fecha';
    if (!formData.time) newErrors.time = 'Selecciona un horario';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Selecciona un método de pago';

    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.date = 'La fecha no puede ser en el pasado';
      
      // Validar que el salón esté abierto ese día
      if (salon && salon.weekSchedule) {
        const dayOfWeek = selectedDate.getDay();
        const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
        if (daySchedule && !daySchedule.isOpen) {
          newErrors.date = 'El salón está cerrado este día. Selecciona otra fecha.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!salon) return; // 🔥 Evita error por null

    setLoading(true);
    try {
      const originalPrice = getServicePrice();
      const finalPrice = selectedPromotion
        ? calculateDiscountedPrice(selectedPromotion)
        : originalPrice;

      const appointmentData: Omit<Appointment, 'id'> = {
        salonId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        promotion: selectedPromotion?.name,
        discount: selectedPromotion?.discount,
        originalPrice,
        finalPrice,
        createdAt: new Date().toISOString(),
      };

      const appointment = await saveAppointment(appointmentData);
      if (!appointment) throw new Error('Error al guardar la reserva');

      // ✅ Enviar notificaciones (email y WhatsApp)
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon: { 
            id: salonId,
            name: salon?.name, 
            email: salon?.email, 
            phone: salon?.phone 
          },
          client: { 
            name: formData.clientName, 
            email: formData.clientEmail, 
            phone: formData.clientPhone 
          },
          service: formData.service,
          date: formData.date,
          time: formData.time,
          promotion: selectedPromotion?.name,
          finalPrice,
          paymentMethod: formData.paymentMethod,
          appointmentId: appointment.id,
        }),
      }).catch(err => console.error('Error calling notify API:', err));

      // 🔗 Si el método de pago seleccionado es online (ej: Mercado Pago), redirigir a la pasarela
      const selectedMethod = salon.paymentMethods?.find(
        (m) => m.name === formData.paymentMethod
      );

      if (selectedMethod && selectedMethod.type === 'online') {
        try {
          const paymentResponse = await fetch('/api/create-appointment-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              salonId,
              appointmentId: appointment.id,
              amount: finalPrice,
              description: `Reserva ${formData.service} - ${salon.name}`,
              payerEmail: formData.clientEmail,
              payerName: formData.clientName,
            }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.ok && paymentData.checkoutUrl) {
            // Redirigir al checkout de Mercado Pago
            window.location.href = paymentData.checkoutUrl as string;
            return; // Evita mostrar el mensaje de éxito local
          } else {
            console.error('Error creating payment preference:', paymentData);
          }
        } catch (err) {
          console.error('Error calling create-appointment-payment API:', err);
        }
      }

      // Si no es pago online o falló crear el pago, mostrar éxito local
      setSuccess(true);
      setTimeout(() => router.push('/client'), 3000);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Hubo un error al crear la reserva. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Resto del render se mantiene igual
  // (No afecta la compilación en Vercel)

  // Obtener horarios del día seleccionado (mañana y tarde combinados)
  const getTimeSlotsForSelectedDate = (): string[] => {
    if (!formData.date || !salon) return [];
    
    const selectedDate = new Date(formData.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Buscar horario del día en weekSchedule
    if (salon.weekSchedule && salon.weekSchedule.length > 0) {
      const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
      
      // Si no encuentra el día o está cerrado, retornar vacío
      if (!daySchedule || !daySchedule.isOpen) {
        return []; // El salón está cerrado ese día
      }
      
      const slots: string[] = [];
      
      // Agregar slots de mañana
      if (daySchedule.morning) {
        const morningSlots = generateTimeSlots(daySchedule.morning.start, daySchedule.morning.end);
        slots.push(...morningSlots);
      }
      
      // Agregar slots de tarde
      if (daySchedule.afternoon) {
        const afternoonSlots = generateTimeSlots(daySchedule.afternoon.start, daySchedule.afternoon.end);
        slots.push(...afternoonSlots);
      }
      
      // Fallback a horarios legacy si existen
      if (slots.length === 0 && daySchedule.start && daySchedule.end) {
        return generateTimeSlots(daySchedule.start, daySchedule.end);
      }
      
      return slots;
    }
    
    // Si no hay weekSchedule configurado, usar horarios por defecto
    // SOLO si no es fin de semana (esto es un fallback de seguridad)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return generateTimeSlots('09:00', '18:00');
    }
    
    return [];
  };
  
  const timeSlots = getTimeSlotsForSelectedDate();
  const minDate = new Date().toISOString().split('T')[0];
  
  // Verificar si el salón está abierto en la fecha seleccionada
  const isClosedOnSelectedDate = (): boolean => {
    if (!formData.date || !salon) return false;
    
    const selectedDate = new Date(formData.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    
    // Si no hay weekSchedule, asumir que fines de semana están cerrados
    if (!salon.weekSchedule || salon.weekSchedule.length === 0) {
      return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
    }
    
    const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
    
    // Si no encuentra el día en el schedule, asumir que está cerrado
    if (!daySchedule) return true;
    
    return !daySchedule.isOpen;
  };

  // Obtener días abiertos del salón
  const getOpenDays = (): number[] => {
    if (!salon || !salon.weekSchedule) return [];
    return salon.weekSchedule
      .filter(day => day.isOpen)
      .map(day => day.day);
  };

  // Verificar si una fecha específica está disponible
  const isDateDisabled = (dateString: string): boolean => {
    if (!salon || !salon.weekSchedule) return false;
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
    return daySchedule ? !daySchedule.isOpen : false;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Exitosa!</h2>
          <p className="text-gray-600 mb-6">
            Tu turno ha sido reservado en <span className="font-semibold">{salon.name}</span>.
            Recibirás una confirmación por email.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Fecha:</span> {new Date(formData.date).toLocaleDateString('es-ES')}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Hora:</span> {formData.time}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Servicio:</span> {formData.service}
            </p>
          </div>
          <Link
            href="/client"
            className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Volver a Salones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/client"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a salones
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Salon Info Sidebar */}
<div className="lg:col-span-1">
  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 animate-slide-up">
    <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-6 text-white mb-6">
      <Scissors className="h-12 w-12 mb-3" />
      <h2 className="text-2xl font-bold mb-2">{salon.name}</h2>

      <div className="flex items-center gap-2 text-white/90">
        <MapPin className="h-4 w-4" />
        {/* ✅ Corregido: reemplaza salon.city por una extracción desde address */}
        <span className="text-sm">
          {salon.address.split(',').pop()?.trim() || 'Ubicación'}
        </span>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Dirección:</p>
        <p className="text-gray-600">{salon.address}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Días y Horarios:</p>
        {salon.weekSchedule && salon.weekSchedule.length > 0 ? (
          <div className="space-y-2">
            {salon.weekSchedule
              .sort((a, b) => {
                // Ordenar: Lunes (1) primero, Domingo (0) último
                const orderA = a.day === 0 ? 7 : a.day;
                const orderB = b.day === 0 ? 7 : b.day;
                return orderA - orderB;
              })
              .map(day => (
                <div 
                  key={day.day} 
                  className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                    day.isOpen 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {day.isOpen ? (
                    <>
                      <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{day.dayName}</div>
                        {day.morning && (
                          <div className="text-gray-600 flex items-center gap-1">
                            <span className="text-yellow-500">☀️</span>
                            <span>{day.morning.start} - {day.morning.end}</span>
                          </div>
                        )}
                        {day.afternoon && (
                          <div className="text-gray-600 flex items-center gap-1">
                            <span className="text-orange-500">🌙</span>
                            <span>{day.afternoon.start} - {day.afternoon.end}</span>
                          </div>
                        )}
                        {/* Fallback a horarios legacy */}
                        {!day.morning && !day.afternoon && day.start && day.end && (
                          <div className="text-gray-600">{day.start} - {day.end}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-4 flex items-center justify-center mt-0.5">
                        <span className="text-red-500 text-lg leading-none">✕</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-500">{day.dayName}</div>
                        <div className="text-gray-400 text-xs italic">Cerrado</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600 p-2 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-primary-600" />
            <span className="text-xs">Lun-Vie: 09:00 - 18:00</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Contacto:</p>
        <p className="text-gray-600 text-sm">{salon.phone}</p>
        <p className="text-gray-600 text-sm">{salon.email}</p>
      </div>

      {salon.description && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Sobre nosotros:</p>
          <p className="text-gray-600 text-sm">{salon.description}</p>
        </div>
      )}
    </div>
  </div>
</div>


          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Reservar Turno
              </h1>
              <p className="text-gray-600 mb-8">
                Completa el formulario para reservar tu turno
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-2 text-primary-600" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.clientName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                        placeholder="Tu nombre completo"
                      />
                      {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-2 text-primary-600" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.clientEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                        placeholder="tu@email.com"
                      />
                      {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-2 text-primary-600" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.clientPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                        placeholder="1123456789"
                      />
                      {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles del Turno</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Scissors className="inline h-4 w-4 mr-2 text-primary-600" />
                        Servicio *
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.service ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white`}
                      >
                        {salon.services.map((service, index) => (
                          <option key={index} value={service.name}>{service.name}</option>
                        ))}
                      </select>
                      {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="inline h-4 w-4 mr-2 text-primary-600" />
                        Fecha *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          // Verificar si el día está cerrado
                          if (selectedDate && isDateDisabled(selectedDate)) {
                            // Limpiar la fecha, horario y mostrar error
                            setFormData(prev => ({ ...prev, date: '', time: '' }));
                            setErrors(prev => ({ 
                              ...prev, 
                              date: '⚠️ El salón está cerrado este día. Selecciona otra fecha.' 
                            }));
                            return;
                          }
                          // Limpiar error de fecha si había
                          if (errors.date) {
                            setErrors(prev => ({ ...prev, date: '' }));
                          }
                          // Si cambia la fecha, limpiar el horario seleccionado
                          if (formData.date !== selectedDate) {
                            setFormData(prev => ({ ...prev, date: selectedDate, time: '' }));
                          } else {
                            handleChange(e);
                          }
                        }}
                        min={minDate}
                        className={`w-full px-4 py-3 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                      />
                      {errors.date && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.date}</p>}
                      {salon.weekSchedule && salon.weekSchedule.length > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium">
                            📅 Días disponibles: {salon.weekSchedule
                              .filter(d => d.isOpen)
                              .map(d => d.dayName)
                              .join(', ')}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            ❌ Días cerrados: {salon.weekSchedule
                              .filter(d => !d.isOpen)
                              .map(d => d.dayName)
                              .join(', ') || 'Ninguno'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline h-4 w-4 mr-2 text-primary-600" />
                        Horario *
                      </label>
                      
                      {isClosedOnSelectedDate() ? (
                        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-center">
                          <p className="text-red-700 font-semibold">El salón está cerrado este día</p>
                          <p className="text-red-600 text-sm mt-1">Por favor selecciona otra fecha</p>
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg text-center">
                          <p className="text-gray-700">Selecciona una fecha para ver horarios disponibles</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {timeSlots.map((slot) => {
                              const isBooked = bookedSlots.includes(slot);
                              const isSelected = formData.time === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => !isBooked && setFormData(prev => ({ ...prev, time: slot }))}
                                  disabled={isBooked}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isBooked
                                      ? 'bg-red-100 text-red-700 border-2 border-red-300 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg border-2 border-primary-600'
                                      : 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200 hover:border-green-400'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                              <span className="text-gray-600">Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                              <span className="text-gray-600">Ocupado</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="inline h-4 w-4 mr-2 text-primary-600" />
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Alguna solicitud especial o comentario..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="inline h-4 w-4 mr-2 text-primary-600" />
                        Método de Pago *
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white`}
                      >
                        <option value="">Selecciona un método de pago</option>
                        {salon.paymentMethods && salon.paymentMethods
                          .filter(method => method.active)
                          .map((method, index) => (
                            <option key={index} value={method.name}>
                              {method.name} {method.type === 'online' ? '(Online)' : '(En el salón)'}
                            </option>
                          ))}
                      </select>
                      {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
                      {formData.paymentMethod && (
                        <p className="text-sm text-gray-600 mt-2">
                          {salon.paymentMethods?.find(m => m.name === formData.paymentMethod)?.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                {formData.service && getServicePrice() > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3">Resumen de Precio</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Servicio: {formData.service}</span>
                        <span className={selectedPromotion ? 'line-through text-gray-500' : 'font-bold'}>
                          ${getServicePrice().toLocaleString()}
                        </span>
                      </div>
                      {selectedPromotion && (
                        <>
                          <div className="flex justify-between text-green-600 font-semibold">
                            <span>Descuento ({selectedPromotion.discount}%)</span>
                            <span>-${((getServicePrice() * selectedPromotion.discount) / 100).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t border-gray-300">
                            <span>Total a Pagar</span>
                            <span>${calculateDiscountedPrice(selectedPromotion).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                            <CheckCircle className="h-4 w-4" />
                            <span>Promoción "{selectedPromotion.name}" aplicada</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/client"
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-center font-semibold"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Reservando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Popup Modal */}
      {showPromotionPopup && availablePromotions.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 ¡Promociones Disponibles!
              </h2>
              <p className="text-gray-600">
                Tienes descuentos disponibles para tu reserva
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {availablePromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="border-2 border-primary-200 rounded-xl p-4 hover:border-primary-500 transition-all cursor-pointer"
                  onClick={() => handleSelectPromotion(promo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{promo.name}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                      {promo.discount}% OFF
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {promo.type === 'service' ? (
                      <span>Descuento en servicios seleccionados</span>
                    ) : (
                      <span>Descuento por día especial</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Precio original:</span>
                    <span className="line-through text-gray-500">${getServicePrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary-600">
                    <span>Precio con descuento:</span>
                    <span>${calculateDiscountedPrice(promo).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => handleSelectPromotion(promo)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      Aplicar esta Promoción
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSkipPromotion}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Continuar sin Promoción
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
