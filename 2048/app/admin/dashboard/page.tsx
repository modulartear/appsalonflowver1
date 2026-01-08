'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Unlock
} from 'lucide-react';
import { getAllSalons, getAppointmentsBySalonId, updateSalonPlan } from '@/lib/api';
import { Salon, Appointment } from '@/lib/types';
import { getDaysRemainingInTrial, isTrialExpired } from '@/lib/utils';

interface SalonStats {
  salon: Salon;
  daysRegistered: number;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  totalAppointments: number;
  monthlyRevenue: number;
  status: 'trial' | 'pro' | 'expired';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [salons, setSalons] = useState<SalonStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState('');

  useEffect(() => {
    // Verificar autenticación
    const isAuth = localStorage.getItem('adminAuth');
    const user = localStorage.getItem('adminUser');
    
    if (!isAuth || isAuth !== 'true') {
      router.push('/admin/login');
      return;
    }
    
    setAdminUser(user || '');
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const allSalons = await getAllSalons();
      
      const statsPromises = allSalons.map(async (salon) => {
        // Calcular días desde registro
        const registrationDate = new Date(salon.planStartDate);
        const now = new Date();
        const daysRegistered = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calcular días restantes de prueba
        const trialEndDate = new Date(registrationDate);
        trialEndDate.setDate(trialEndDate.getDate() + 15);
        const trialDaysRemaining = getDaysRemainingInTrial(trialEndDate.toISOString());
        const expired = isTrialExpired(trialEndDate.toISOString());
        
        // Obtener citas del salón
        const appointments = await getAppointmentsBySalonId(salon.id);
        
        // Calcular facturación mensual (estimado)
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate.getMonth() === currentMonth && 
                 aptDate.getFullYear() === currentYear &&
                 apt.status !== 'cancelled';
        });
        
        // Estimar revenue (precio promedio por servicio: $5000)
        const avgServicePrice = 5000;
        const monthlyRevenue = monthlyAppointments.length * avgServicePrice;
        
        // Determinar estado
        let status: 'trial' | 'pro' | 'expired' = 'trial';
        if (salon.plan === 'pro') {
          status = 'pro';
        } else if (expired) {
          status = 'expired';
        }
        
        return {
          salon,
          daysRegistered,
          trialDaysRemaining,
          isTrialExpired: expired,
          totalAppointments: appointments.length,
          monthlyRevenue,
          status
        };
      });
      
      const stats = await Promise.all(statsPromises);
      setSalons(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const handleEnableSalon = async (salonId: string, salonName: string) => {
    if (!confirm(`¿Habilitar el salón "${salonName}" con plan PRO?`)) {
      return;
    }

    try {
      const success = await updateSalonPlan(salonId, 'pro');
      if (success) {
        alert(`✅ Salón "${salonName}" habilitado con plan PRO exitosamente`);
        // Recargar datos
        loadDashboardData();
      } else {
        alert('❌ Error al habilitar el salón. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error enabling salon:', error);
      alert('❌ Error al habilitar el salón. Intenta nuevamente.');
    }
  };

  // Calcular totales
  const totalSalons = salons.length;
  const totalRevenue = salons.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalAppointments = salons.reduce((sum, s) => sum + s.totalAppointments, 0);
  const activeSalons = salons.filter(s => s.status !== 'expired').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Bienvenido, {adminUser}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Salones */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalSalons}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Salones</h3>
            <p className="text-xs text-gray-500 mt-1">{activeSalons} activos</p>
          </div>

          {/* Facturación Mensual */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                ${(totalRevenue / 1000).toFixed(0)}k
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Facturación Mensual</h3>
            <p className="text-xs text-gray-500 mt-1">Estimado</p>
          </div>

          {/* Total Turnos */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalAppointments}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Turnos</h3>
            <p className="text-xs text-gray-500 mt-1">Todos los salones</p>
          </div>

          {/* Promedio por Salón */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {totalSalons > 0 ? Math.round(totalAppointments / totalSalons) : 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Turnos por Salón</h3>
            <p className="text-xs text-gray-500 mt-1">Promedio</p>
          </div>
        </div>

        {/* Salons Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Salones Registrados</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salón
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Registrado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Prueba Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turnos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facturación Mensual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salons.map((stat) => (
                  <tr key={stat.salon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stat.salon.name}</div>
                        <div className="text-xs text-gray-500">{stat.salon.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stat.status === 'pro' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          PRO
                        </span>
                      ) : stat.status === 'expired' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3" />
                          Expirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3" />
                          Prueba
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.daysRegistered} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stat.status === 'pro' ? (
                        <span className="text-sm text-gray-500">N/A (PRO)</span>
                      ) : stat.isTrialExpired ? (
                        <span className="text-sm font-semibold text-red-600">Expirado</span>
                      ) : (
                        <span className={`text-sm font-semibold ${
                          stat.trialDaysRemaining <= 3 ? 'text-red-600' : 
                          stat.trialDaysRemaining <= 7 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {stat.trialDaysRemaining} días
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalAppointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${stat.monthlyRevenue.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {stat.status === 'expired' ? (
                        <button
                          onClick={() => handleEnableSalon(stat.salon.id, stat.salon.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-medium shadow-sm hover:shadow-md"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Habilitar PRO
                        </button>
                      ) : stat.status === 'pro' ? (
                        <span className="text-xs text-gray-400 italic">Ya es PRO</span>
                      ) : (
                        <button
                          onClick={() => handleEnableSalon(stat.salon.id, stat.salon.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-medium shadow-sm hover:shadow-md"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Activar PRO
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {salons.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay salones registrados aún</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
