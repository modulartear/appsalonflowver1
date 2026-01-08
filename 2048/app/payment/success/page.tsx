'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Gracias por contratar el Plan Pro. Tu suscripción está activa.
        </p>
        <p className="text-gray-600 mb-8">
          El siguiente paso es registrar los datos de tu salón para empezar a usar la plataforma.
        </p>
        <Link
          href="/salon/register"
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          Registrar Mi Salón
        </Link>
      </div>
    </div>
  );
}
