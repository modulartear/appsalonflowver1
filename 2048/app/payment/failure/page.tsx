'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pago Rechazado</h1>
        <p className="text-gray-600 mb-8">
          Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o usa otro método de pago.
        </p>
        <Link
          href="/#pricing"
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          Volver a Intentar
        </Link>
      </div>
    </div>
  );
}
