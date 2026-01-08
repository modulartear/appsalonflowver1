'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Scissors, 
  Calendar, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  TrendingUp,
  CreditCard,
  Tag,
  Settings,
  Share2
} from 'lucide-react';
import { getSalonById, getAppointmentsBySalonId, updateAppointmentStatus, updateSalon, saveServices, saveStylists, savePaymentMethods, savePromotions, updateSalonPlan } from '@/lib/api';
import { Salon, Appointment } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import ServicesManager from '@/components/ServicesManager';
import PromotionsManager from '@/components/PromotionsManager';
import SettingsManager from '@/components/SettingsManager';
import TrialExpiredModal from '@/components/TrialExpiredModal';

export default function SalonDashboard() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'promotions' | 'settings'>('appointments');
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    if (salonId) {
      loadSalonData();
    }
  }, [salonId]);

  useEffect(() => {
    if (salon?.planStartDate) {
      calculateDaysRemaining();
    }
  }, [salon]);

  const calculateDaysRemaining = () => {
    if (!salon?.planStartDate) return;
    
    const today = new Date();
    
    // Si tiene trialEndDate, usarlo; sino calcular
    let endDate: Date;
    if (salon.trialEndDate) {
      endDate = new Date(salon.trialEndDate);
    } else {
      const startDate = new Date(salon.planStartDate);
      const daysInPlan = salon.plan === 'free' ? 15 : 30;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + daysInPlan);
    }
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(diffDays);
    
    // Verificar si el período ha expirado
    if (salon.plan === 'free' && (diffDays <= 0 || !salon.isActive)) {
      setIsTrialExpired(true);
      setShowTrialExpiredModal(true);
    }
  };

  const loadSalonData = async () => {
    const salonData = await getSalonById(salonId);
    if (salonData) {
      setSalon(salonData);
      
      // Verificar si el salón está inactivo o el período expiró
      if (!salonData.isActive || (salonData.plan === 'free' && salonData.trialEndDate && new Date() > new Date(salonData.trialEndDate))) {
        setIsTrialExpired(true);
        setShowTrialExpiredModal(true);
      }
      
      await loadAppointments();
    } else {
      router.push('/');
    }
  };

  const loadAppointments = async () => {
    const appts = await getAppointmentsBySalonId(salonId);
    const sorted = appts.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    setAppointments(sorted);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    await updateAppointmentStatus(appointmentId, newStatus);
    await loadAppointments();
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/client/book/${salonId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const bookingLink = `${window.location.origin}/client/book/${salonId}`;
    
    // Obtener top 3 servicios más populares o los primeros 3
    const topServices = salon?.services
      .filter(s => s.active)
      .slice(0, 3)
      .map(s => `${s.name} $${s.price.toLocaleString()}`)
      .join(' • ') || '';

    // Obtener primera promoción activa
    const activePromotions = salon?.promotions?.filter(p => p.active) || [];
    const promoText = activePromotions.length > 0
      ? `\n🎁 ${activePromotions[0].name} ${activePromotions[0].discount}% OFF`
      : '';

    // Crear mensaje compacto para WhatsApp Estados (máx 700 caracteres)
    const message = `✨ *${salon?.name}* ✨

📅 ¡Reservá tu turno!

${topServices}${promoText}

⏰ Lun-Sáb 09:00-18:00
📍 ${salon?.address}
📞 ${salon?.phone}

🔗 Reservá aquí:
${bookingLink}

¡Te esperamos! 💇‍♀️`;

    // Verificar longitud (máx 700 caracteres para estados de WhatsApp)
    if (message.length > 700) {
      console.warn(`Mensaje muy largo: ${message.length} caracteres. Máximo: 700`);
    }

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleUpgradeToPro = async () => {
    if (!salon) return;
    
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          salonId: salon.id, 
          salonName: salon.name,
          payerEmail: salon.email,
          payerName: salon.ownerName
        }),
      });

      const data = await response.json();

      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'No se pudo crear el link de pago.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Hubo un error al iniciar el pago. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdateServices = async (services: any[]) => {
    if (salon) {
      await saveServices(salonId, services);
      setSalon({ ...salon, services });
    }
  };

  const handleUpdatePromotions = async (promotions: any[]) => {
    if (salon) {
      await savePromotions(salonId, promotions);
      setSalon({ ...salon, promotions });
    }
  };

  const handleUpdateStylists = async (stylists: any[]) => {
    if (salon) {
      await saveStylists(salonId, stylists);
      setSalon({ ...salon, stylists });
    }
  };

  const handleUpdatePaymentMethods = async (paymentMethods: any[]) => {
    if (salon) {
      await savePaymentMethods(salonId, paymentMethods);
      setSalon({ ...salon, paymentMethods });
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  // Función helper para calcular ingresos
  const calculateIncome = (filterFn: (a: Appointment) => boolean) => {
    return appointments
      .filter(a => a.status === 'completed' && filterFn(a))
      .reduce((sum, a) => {
        let value: any = a.finalPrice ?? a.originalPrice;
        let amount = 0;
        if (value !== undefined && value !== null) {
          const vstr = typeof value === 'string' ? value.replace(/,/g, '.') : value;
          const n = typeof vstr === 'string' ? parseFloat(vstr) : Number(vstr);
          amount = isNaN(n) ? 0 : n;
        }
        if (!amount) {
          const svc = (salon?.services ?? []).find(s => s.name === a.service);
          if (svc && typeof svc.price !== 'undefined' && svc.price !== null) {
            amount = typeof svc.price === 'number' ? svc.price : Number(svc.price as any) || 0;
          }
        }
        return sum + amount;
      }, 0);
  };

  // Ingresos de hoy
  const today = new Date();
  const incomesToday = calculateIncome((a) => {
    const raw = (a.createdAt as unknown as string) || '';
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
    const todayPart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return datePart === todayPart;
  });

  // Ingresos del mes
  const incomesThisMonth = calculateIncome((a) => {
    const raw = (a.createdAt as unknown as string) || '';
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
    if (!datePart) return false;
    const appointmentDate = new Date(`${datePart}T00:00:00`);
    return appointmentDate.getFullYear() === today.getFullYear() && 
           appointmentDate.getMonth() === today.getMonth();
  });

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Scissors className="h-10 w-10 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{salon.name}</h1>
                <p className="text-gray-600">Panel de Control</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={shareToWhatsApp}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="h-5 w-5" />
                Compartir en WhatsApp
              </button>
              <button
                onClick={copyBookingLink}
                className="px-4 py-2 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copiar Link
                  </>
                )}
              </button>
              <Link
                href={`/client/book/${salonId}`}
                target="_blank"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Ver Página
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Banner */}
        {salon.plan === 'free' && (
          <div className="rounded-2xl p-6 mb-8 animate-fade-in bg-gradient-to-r from-accent-500 to-accent-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  🎉 Plan Gratis
                  {daysRemaining !== null && (
                    <span className="ml-3 text-lg font-normal">
                      {daysRemaining > 0 
                        ? `(${daysRemaining} ${daysRemaining === 1 ? 'día restante' : 'días restantes'})`
                        : '(Período de prueba expirado)'
                      }
                    </span>
                  )}
                </h3>
                <p className="text-white/90">
                  {daysRemaining !== null && daysRemaining <= 0 
                    ? '⚠️ Tu período de prueba ha finalizado. Actualiza al Plan Pro para continuar usando todas las funcionalidades.'
                    : 'Disfruta de todas las funcionalidades. Actualiza al Plan Pro para acceso ilimitado.'
                  }
                </p>
              </div>
              <Link
                href="/#pricing"
                className={`px-6 py-3 bg-white rounded-lg hover:shadow-lg transition-all font-semibold whitespace-nowrap ${
                  daysRemaining !== null && daysRemaining <= 0 
                    ? 'text-red-600 animate-pulse' 
                    : 'text-accent-600'
                }`}
              >
                Actualizar a Pro - $49000/mes
              </Link>
            </div>
          </div>
        )}

        {salon.plan === 'pro' && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <h3 className="text-2xl font-bold">
                    Plan Pro Activo
                    {daysRemaining !== null && daysRemaining > 0 && (
                      <span className="ml-3 text-lg font-normal">
                        ({daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'} hasta renovación)
                      </span>
                    )}
                  </h3>
                  <p className="text-white/90">Tienes acceso completo a todas las funcionalidades</p>
                </div>
              </div>
              {daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
                <div className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold">
                  ⚠️ Renovación próxima
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Scissors className="h-5 w-5" />
            Servicios
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'promotions'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Tag className="h-5 w-5" />
            Promociones
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-5 w-5" />
            Configuración
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
        {/* Salon Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Información del Salón</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Propietario</p>
                <p className="font-semibold text-gray-900">{salon.ownerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{salon.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-semibold text-gray-900">{salon.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-semibold text-gray-900">{salon.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scissors className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">ID del Salón</p>
                <p className="font-semibold text-gray-900 text-xs break-all">{salon.id}</p>
              </div>
            </div>
          </div>
          {salon.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700">{salon.description}</p>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Servicios:</p>
            <div className="flex flex-wrap gap-2">
              {salon.services.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-gray-800 rounded-full text-sm font-medium"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Reservas</h3>
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Pendientes</h3>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Confirmadas</h3>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Completadas</h3>
              <TrendingUp className="h-8 w-8 text-accent-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Ingresos (Hoy)</h3>
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${incomesToday.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-medium">Ingresos del Mes</h3>
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <p className="text-3xl font-bold text-white">${incomesThisMonth.toLocaleString()}</p>
            <p className="text-white/80 text-xs mt-2">
              {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmadas ({stats.confirmed})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed'
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completadas ({stats.completed})
              </button>
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === 'all' 
                  ? 'No hay reservas aún' 
                  : `No hay reservas ${filter === 'pending' ? 'pendientes' : filter === 'confirmed' ? 'confirmadas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{appointment.clientName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-accent-100 text-accent-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'pending' ? 'Pendiente' :
                           appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'completed' ? 'Completada' :
                           'Cancelada'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary-600" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary-600" />
                          <span>{formatTime(appointment.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary-600" />
                          <span className="font-medium">{appointment.service}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary-600" />
                          <span>{appointment.clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Mail className="h-4 w-4 text-primary-600" />
                          <span>{appointment.clientEmail}</span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Notas:</span> {appointment.notes}
                          </p>
                        </div>
                      )}

                      {/* Payment and Price Info */}
                      {(appointment.paymentMethod || appointment.promotion) && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                          <div className="space-y-2">
                            {appointment.paymentMethod && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-700">Método de Pago:</span>
                                <span className="text-gray-900">{appointment.paymentMethod}</span>
                              </div>
                            )}
                            {appointment.promotion && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-gray-700">Promoción:</span>
                                  <span className="text-green-600 font-semibold">{appointment.promotion} ({appointment.discount}% OFF)</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-gray-700">Precio Original:</span>
                                  <span className="line-through text-gray-500">${appointment.originalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-base font-bold border-t border-gray-300 pt-2">
                                  <span className="text-gray-900">Total:</span>
                                  <span className="text-primary-600">${appointment.finalPrice?.toLocaleString()}</span>
                                </div>
                              </>
                            )}
                            {!appointment.promotion && appointment.finalPrice && (
                              <div className="flex items-center justify-between text-base font-bold">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-primary-600">${appointment.finalPrice?.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="flex-1 lg:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Completar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && salon && (
          <ServicesManager 
            services={salon.services} 
            onUpdate={handleUpdateServices} 
          />
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && salon && (
          <PromotionsManager 
            promotions={salon.promotions || []} 
            services={salon.services}
            onUpdate={handleUpdatePromotions}
            salonId={salonId}
            salonName={salon.name}
            salonAddress={salon.address}
            salonPhone={salon.phone}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && salon && (
          <SettingsManager 
            stylists={salon.stylists || []} 
            paymentMethods={salon.paymentMethods || []}
            onUpdateStylists={handleUpdateStylists}
            onUpdatePaymentMethods={handleUpdatePaymentMethods}
          />
        )}
      </div>

      {/* Modal de período expirado */}
      {showTrialExpiredModal && salon && (
        <TrialExpiredModal
          salonName={salon.name}
          onUpgrade={handleUpgradeToPro}
        />
      )}

      {/* Overlay para bloquear interacción si el período expiró */}
      {isTrialExpired && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 pointer-events-none" />
      )}
    </div>
  );
}
