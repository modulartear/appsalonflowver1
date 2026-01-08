'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors, ArrowLeft, LogIn, Mail, Lock, Crown, CreditCard } from 'lucide-react';
import { validateSalonCredentials } from '@/lib/api';

export default function SalonLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiredSalon, setExpiredSalon] = useState<any>(null);
  const [upgradingToPro, setUpgradingToPro] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setExpiredSalon(null);
  };

  const handleUpgradeToPro = async () => {
    if (!expiredSalon) return;

    setUpgradingToPro(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: expiredSalon.id,
          salonName: expiredSalon.name,
          payerEmail: expiredSalon.email,
          payerName: expiredSalon.ownerName
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
      setUpgradingToPro(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const salon = await validateSalonCredentials(formData.email, formData.password);

      if (!salon) {
        setError('Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      // Verificar si el salón está activo
      if (!salon.isActive) {
        setError('trial-expired');
        setExpiredSalon(salon);
        setLoading(false);
        return;
      }

      // Verificar si el período de prueba ha expirado (para plan free)
      if (salon.plan === 'free' && salon.trialEndDate) {
        const trialEnd = new Date(salon.trialEndDate);
        const now = new Date();

        if (now > trialEnd) {
          setError('trial-expired');
          setExpiredSalon(salon);
          setLoading(false);
          return;
        }
      }

      // Login successful
      router.push(`/salon/dashboard/${salon.id}`);
    } catch (error) {
      console.error('Error during login:', error);
      setError('Hubo un error al iniciar sesión. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Scissors className="h-12 w-12 text-primary-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                SalonFlow
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accede a tu Salón
            </h2>
            <p className="text-gray-600">
              Ingresa con tu email y contraseña
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          {error === 'trial-expired' && expiredSalon ? (
            <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-amber-100 rounded-full p-2">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Período de prueba finalizado</h3>
                  <p className="text-sm text-gray-700">
                    Tu período de prueba gratuito de 15 días ha terminado.
                    Actualiza a <span className="font-semibold">Plan Pro</span> para continuar usando SalonFlow.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-600 mb-2 font-semibold">✨ Beneficios del Plan Pro:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Reservas ilimitadas sin restricciones</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Notificaciones automáticas por WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>

              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  $49.000<span className="text-sm text-gray-600 font-normal">/mes</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpgradeToPro}
                disabled={upgradingToPro}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {upgradingToPro ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Actualizar a Plan Pro
                  </>
                )}
              </button>
            </div>
          ) : error && error !== 'trial-expired' ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : null}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2 text-primary-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-2 text-primary-600" />
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Ingresando...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Ingresar a mi Salón
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/salon/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Registra tu salón gratis
              </Link>
            </p>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-primary-100 to-accent-100 rounded-xl p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-2">💡 ¿Olvidaste tu contraseña?</h3>
          <p className="text-gray-700 text-sm">
            Contáctanos en <a href="mailto:appsalonflow@gmail.com" className="text-primary-600 hover:text-primary-700 font-semibold">appsalonflow@gmail.com</a> y te ayudaremos a recuperar el acceso.
          </p>
        </div>
      </div>
    </div>
  );
}
