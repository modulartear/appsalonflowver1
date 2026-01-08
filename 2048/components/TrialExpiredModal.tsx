'use client';

import { Crown, X, CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TrialExpiredModalProps {
  salonName: string;
  onClose?: () => void;
  onUpgrade: () => void;
}

export default function TrialExpiredModal({ salonName, onClose, onUpgrade }: TrialExpiredModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await onUpgrade();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up relative">
        {/* Close button (opcional) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full p-4">
            <Crown className="h-12 w-12 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Tu período de prueba ha finalizado
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          <span className="font-semibold text-gray-900">{salonName}</span>, tu período de prueba gratuito de 15 días ha terminado.
        </p>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            Beneficios del Plan Pro
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Reservas ilimitadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Gestión completa de servicios y promociones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Notificaciones automáticas por WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Soporte prioritario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Sin límite de tiempo</span>
            </li>
          </ul>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900">
            $5.000
            <span className="text-lg text-gray-600 font-normal">/mes</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Pago mensual - Cancela cuando quieras</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
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

          <p className="text-xs text-center text-gray-500">
            Al actualizar, aceptas nuestros términos y condiciones
          </p>
        </div>

        {/* Contact */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes preguntas?{' '}
            <a
              href="mailto:appsalonflow@gmail.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
