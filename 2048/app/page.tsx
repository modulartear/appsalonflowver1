'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Scissors, Calendar, Users, Sparkles, Clock, Shield, TrendingUp, Heart, Check, Zap, Crown } from 'lucide-react';
import Chatbot from '@/components/Chatbot';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleProPlanClick = async () => {
    // Solicitar email del usuario antes de proceder
    const email = prompt('Por favor, ingresa tu email para continuar con el pago:');
    
    if (!email) {
      alert('El email es necesario para procesar el pago.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un email válido.');
      return;
    }

    const name = prompt('Por favor, ingresa tu nombre:');
    
    if (!name) {
      alert('El nombre es necesario para procesar el pago.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          salonId: 'new-pro-salon', 
          salonName: name,
          payerEmail: email,
          payerName: name
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                SalonFlow
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium">
                Características
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 font-medium">
                Planes
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium">
                Cómo Funciona
              </a>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/salon/login"
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-all"
              >
                Mi Salón
              </Link>
              <Link
                href="/salon/register"
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Registrar Salón
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
              Gestiona tu Salón de Belleza
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La plataforma moderna para reservas de turnos en salones de estética y peluquerías.
              Simple, rápida y profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                href="#pricing"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg font-semibold"
              >
                Ver Planes
              </Link>
              <Link
                href="/salon/register"
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl hover:bg-primary-50 transform hover:scale-105 transition-all text-lg font-semibold"
              >
                Comenzar Gratis 15 Días
              </Link>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-20 relative animate-slide-up">
            <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Calendar className="h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Reservas Online</h3>
                  <p className="text-gray-600">Gestiona turnos 24/7 desde cualquier dispositivo</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Users className="h-12 w-12 text-accent-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Panel de Control</h3>
                  <p className="text-gray-600">Visualiza todas tus reservas en tiempo real</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Sparkles className="h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Experiencia Premium</h3>
                  <p className="text-gray-600">Interfaz moderna y fácil de usar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para gestionar tu salón de manera profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all group">
              <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Horarios Flexibles</h3>
              <p className="text-gray-600">Configura tus horarios de trabajo y disponibilidad</p>
            </div>

            <div className="p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all group">
              <div className="bg-accent-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Seguro y Confiable</h3>
              <p className="text-gray-600">Tus datos están protegidos y seguros</p>
            </div>

            <div className="p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all group">
              <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Crece tu Negocio</h3>
              <p className="text-gray-600">Atrae más clientes con presencia online</p>
            </div>

            <div className="p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all group">
              <div className="bg-accent-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fácil de Usar</h3>
              <p className="text-gray-600">Interfaz intuitiva para ti y tus clientes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan perfecto para tu salón
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Gratis */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all animate-slide-up">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-10 w-10" />
                  <h3 className="text-3xl font-bold">Plan Gratis</h3>
                </div>
                <p className="text-accent-100 text-lg mb-6">
                  Prueba todas las funcionalidades sin compromiso
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-accent-100 text-lg">/ 15 días</span>
                </div>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>15 días gratis</strong> desde el registro
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Reservas ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Panel de control completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Link personalizado de reservas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Gestión de servicios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Soporte por email</span>
                  </li>
                </ul>

                <Link
                  href="/salon/register"
                  className="w-full block text-center px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
                >
                  Comenzar Prueba Gratis
                </Link>
                <p className="text-center text-sm text-gray-500 mt-4">
                  No se requiere tarjeta de crédito
                </p>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all animate-slide-up border-4 border-primary-500 relative" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold text-sm">
                RECOMENDADO
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-10 w-10" />
                  <h3 className="text-3xl font-bold">Plan Pro</h3>
                </div>
                <p className="text-primary-100 text-lg mb-6">
                  Acceso completo sin límites para tu salón
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$49000</span>
                  <span className="text-primary-100 text-lg">/ mes</span>
                </div>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Todo del Plan Gratis</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Acceso ilimitado</strong> sin restricciones
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Estadísticas avanzadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Notificaciones por email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Soporte prioritario 24/7</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Personalización avanzada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Múltiples sucursales</span>
                  </li>
                </ul>

                <button
                  onClick={handleProPlanClick}
                  disabled={loading}
                  className="w-full block text-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Comenzar con Plan Pro'}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Facturación mensual • Cancela cuando quieras
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 text-lg mb-4">
              ¿Tienes preguntas sobre nuestros planes?
            </p>
            <p className="text-gray-700 font-medium">
              Contáctanos: <a href="mailto:info@salonflow.com" className="text-primary-600 hover:text-primary-700">info@salonflow.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600">
              En solo 3 simples pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Registra tu Salón</h3>
              <p className="text-gray-600 text-lg">
                Completa el formulario con la información de tu salón, servicios y horarios.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Comparte tu Link</h3>
              <p className="text-gray-600 text-lg">
                Obtén tu link único de reservas y compártelo con tus clientes por WhatsApp, redes sociales o email.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-br from-primary-500 to-accent-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Gestiona tu Agenda</h3>
              <p className="text-gray-600 text-lg">
                Visualiza y administra todas tus reservas desde tu panel de control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Beneficios para tu Salón
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Presencia Online Profesional</h4>
              <p className="text-gray-600">Destaca tu salón con un perfil atractivo y moderno que inspire confianza</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-accent-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Gestión Simplificada</h4>
              <p className="text-gray-600">Organiza turnos sin llamadas telefónicas. Todo automatizado en un solo lugar</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Aumenta tus Ingresos</h4>
              <p className="text-gray-600">Más visibilidad y facilidad de reserva = más clientes y más ventas</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-accent-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Disponibilidad 24/7</h4>
              <p className="text-gray-600">Tus clientes pueden reservar en cualquier momento, incluso fuera de horario</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Base de Clientes</h4>
              <p className="text-gray-600">Mantén un registro de todos tus clientes y sus preferencias</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-accent-600" />
              </div>
              <h4 className="font-bold text-xl mb-3">Seguro y Confiable</h4>
              <p className="text-gray-600">Tus datos y los de tus clientes están protegidos y seguros</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a SalonFlow hoy y lleva tu salón al siguiente nivel
          </p>
          <Link
            href="/salon/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg font-semibold"
          >
            Registrar Mi Salón Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-bold">SalonFlow</span>
              </div>
              <p className="text-gray-400">
                La plataforma líder para gestión de turnos en salones de belleza.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white">
                    Planes y Precios
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white">
                    Características
                  </a>
                </li>
                <li>
                  <Link href="/salon/register" className="text-gray-400 hover:text-white">
                    Registrar Salón
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <p className="text-gray-400">
                Email: appsalonflow@gmail.com<br />
                Teléfono: +54 3462 587692
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SalonFlow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
