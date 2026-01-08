'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors, ArrowLeft, Plus, X } from 'lucide-react';
import { isValidEmail, isValidPhone, calculateTrialEndDate } from '@/lib/utils';
import { saveSalon, getSalonByEmail } from '@/lib/api';
import { Salon, Service, DaySchedule } from '@/lib/types';

export default function SalonRegister() {
  const router = useRouter();
  const [services, setServices] = useState<string[]>(['Corte de cabello', 'Coloración']);
  const [newService, setNewService] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Horarios por día de la semana con turnos mañana y tarde
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    { 
      day: 1, 
      dayName: 'Lunes', 
      isOpen: true, 
      morning: { start: '08:00', end: '13:00' },
      afternoon: { start: '14:00', end: '20:00' }
    },
    { 
      day: 2, 
      dayName: 'Martes', 
      isOpen: true, 
      morning: { start: '08:00', end: '13:00' },
      afternoon: { start: '14:00', end: '20:00' }
    },
    { 
      day: 3, 
      dayName: 'Miércoles', 
      isOpen: true, 
      morning: { start: '08:00', end: '13:00' },
      afternoon: { start: '14:00', end: '20:00' }
    },
    { 
      day: 4, 
      dayName: 'Jueves', 
      isOpen: true, 
      morning: { start: '08:00', end: '13:00' },
      afternoon: { start: '14:00', end: '20:00' }
    },
    { 
      day: 5, 
      dayName: 'Viernes', 
      isOpen: true, 
      morning: { start: '08:00', end: '13:00' },
      afternoon: { start: '14:00', end: '20:00' }
    },
    { 
      day: 6, 
      dayName: 'Sábado', 
      isOpen: false, 
      morning: { start: '09:00', end: '13:00' },
      afternoon: { start: '14:00', end: '18:00' }
    },
    { 
      day: 0, 
      dayName: 'Domingo', 
      isOpen: false, 
      morning: { start: '09:00', end: '13:00' },
      afternoon: { start: '14:00', end: '18:00' }
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleScheduleChange = (
    dayIndex: number, 
    field: 'isOpen' | 'morningStart' | 'morningEnd' | 'afternoonStart' | 'afternoonEnd', 
    value: boolean | string
  ) => {
    setWeekSchedule(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      
      if (field === 'isOpen') {
        return { ...day, isOpen: value as boolean };
      }
      
      // Actualizar horarios de mañana
      if (field === 'morningStart') {
        return { 
          ...day, 
          morning: { ...day.morning!, start: value as string }
        };
      }
      if (field === 'morningEnd') {
        return { 
          ...day, 
          morning: { ...day.morning!, end: value as string }
        };
      }
      
      // Actualizar horarios de tarde
      if (field === 'afternoonStart') {
        return { 
          ...day, 
          afternoon: { ...day.afternoon!, start: value as string }
        };
      }
      if (field === 'afternoonEnd') {
        return { 
          ...day, 
          afternoon: { ...day.afternoon!, end: value as string }
        };
      }
      
      return day;
    }));
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre del salón es requerido';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'El nombre del propietario es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido (8-15 dígitos)';
    }
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (services.length === 0) newErrors.services = 'Agrega al menos un servicio';
    
    // Validar que al menos un día esté abierto
    const hasOpenDay = weekSchedule.some(day => day.isOpen);
    if (!hasOpenDay) newErrors.schedule = 'Debes seleccionar al menos un día de atención';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Verificar si el email ya existe
      const existingSalon = await getSalonByEmail(formData.email);
      if (existingSalon) {
        setErrors({ email: 'Este email ya está registrado' });
        setLoading(false);
        return;
      }

      const now = new Date();
      
      const salonData: Omit<Salon, 'id'> = {
        name: formData.name,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password, // Se hasheará en la API
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}`,
        description: formData.description,
        services: [], // Se agregarán después
        plan: 'free',
        planStartDate: now.toISOString(),
        isActive: true,
        trialEndDate: calculateTrialEndDate(now, 'free'),
        stylists: [],
        paymentMethods: [],
        promotions: [],
        weekSchedule: weekSchedule, // Horarios por día
      };

      const salon = await saveSalon(salonData);

      if (!salon) {
        throw new Error('Error al guardar el salón');
      }

      // Guardar servicios iniciales
      const { saveServices } = await import('@/lib/api');
      const serviceObjects: Service[] = services.map(serviceName => ({
        id: crypto.randomUUID(),
        name: serviceName,
        duration: 60,
        price: 0,
        description: '',
        active: true,
      }));
      
      await saveServices(salon.id, serviceObjects);

      // Redirect to dashboard
      router.push(`/salon/dashboard/${salon.id}`);
    } catch (error) {
      console.error('Error saving salon:', error);
      alert('Hubo un error al registrar el salón. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <Scissors className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Registra tu Salón
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Completa el formulario para comenzar a recibir reservas online
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          {/* Salon Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Información del Salón</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Salón *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Ej: Bella Estética"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Propietario *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.ownerName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Tu nombre completo"
                />
                {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="salon@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Repite tu contraseña"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="1123456789"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Av. Principal 123"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                  placeholder="Buenos Aires"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Describe tu salón, especialidades, ambiente, etc."
              />
            </div>
          </div>

          {/* Working Hours by Day with Morning/Afternoon */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Horarios de Atención por Día</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Configura los días y horarios en que tu salón atiende. Puedes definir turnos de mañana y tarde por separado.
            </p>
            
            {errors.schedule && <p className="text-red-500 text-sm mb-4">{errors.schedule}</p>}
            
            <div className="space-y-4">
              {weekSchedule.map((daySchedule, index) => (
                <div 
                  key={daySchedule.day} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    daySchedule.isOpen 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {/* Checkbox y nombre del día */}
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen}
                      onChange={(e) => handleScheduleChange(index, 'isOpen', e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <label className="font-bold text-lg text-gray-900">
                      {daySchedule.dayName}
                    </label>
                  </div>

                  {/* Horarios de Mañana y Tarde */}
                  {daySchedule.isOpen ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                      {/* Turno Mañana */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-yellow-500">☀️</span>
                          Turno Mañana
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Desde
                            </label>
                            <input
                              type="time"
                              value={daySchedule.morning?.start || '08:00'}
                              onChange={(e) => handleScheduleChange(index, 'morningStart', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <span className="text-gray-400 mt-5">→</span>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Hasta
                            </label>
                            <input
                              type="time"
                              value={daySchedule.morning?.end || '13:00'}
                              onChange={(e) => handleScheduleChange(index, 'morningEnd', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Turno Tarde */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-orange-500">🌙</span>
                          Turno Tarde
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Desde
                            </label>
                            <input
                              type="time"
                              value={daySchedule.afternoon?.start || '14:00'}
                              onChange={(e) => handleScheduleChange(index, 'afternoonStart', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <span className="text-gray-400 mt-5">→</span>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Hasta
                            </label>
                            <input
                              type="time"
                              value={daySchedule.afternoon?.end || '20:00'}
                              onChange={(e) => handleScheduleChange(index, 'afternoonEnd', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-8">
                      <span className="text-gray-500 text-sm italic">Cerrado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Servicios Ofrecidos</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Agregar servicio (ej: Manicura, Pedicura)"
              />
              <button
                type="button"
                onClick={addService}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Agregar
              </button>
            </div>

            {errors.services && <p className="text-red-500 text-sm mb-4">{errors.services}</p>}

            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in"
                >
                  <span className="text-gray-800 font-medium">{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-center font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Registrando...' : 'Registrar Salón'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-6">
          * Campos obligatorios
        </p>
      </div>
    </div>
  );
}
