'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
        <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pago Pendiente</h1>
        <p className="text-gray-600 mb-8">
          Tu pago está siendo procesado. Recibirás una confirmación por email una vez que se apruebe.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          Volver a la Página Principal
        </Link>
      </div>
    </div>
  );
}
