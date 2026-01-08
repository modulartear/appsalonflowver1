import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Aseguramos que esta ruta corre en el runtime de Node.js
export const runtime = 'nodejs';

const { MERCADOPAGO_ACCESS_TOKEN } = process.env;

export async function POST(req: NextRequest) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'MercadoPago is not configured on the server.' },
      { status: 500 }
    );
  }

  const { salonId, appointmentId, amount, description, payerEmail, payerName } = await req.json();

  if (!salonId || !appointmentId) {
    return NextResponse.json(
      { ok: false, error: 'salonId and appointmentId are required.' },
      { status: 400 }
    );
  }

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: 'A valid payment amount is required.' },
      { status: 400 }
    );
  }

  const backUrlBase = req.nextUrl.origin;

  const preference = {
    items: [
      {
        id: appointmentId,
        title: description || 'Reserva de turno',
        quantity: 1,
        unit_price: Number(amount),
        currency_id: 'ARS',
      },
    ],
    payer: {
      email: payerEmail || undefined,
      name: payerName || undefined,
    },
    back_urls: {
      success: `${backUrlBase}/client`,
      failure: `${backUrlBase}/client`,
      pending: `${backUrlBase}/client`,
    },
    auto_return: 'approved',
    external_reference: appointmentId,
    notification_url: `${backUrlBase}/api/webhooks/mercadopago?source_news=ipn`,
  };

  try {
    const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
    const preferenceApi = new Preference(client);

    const response = await preferenceApi.create({ body: preference });
    const checkoutUrl = response.init_point;

    if (!checkoutUrl) {
      console.error('[MercadoPago] Error: init_point not found in response', response);
      throw new Error('Failed to get checkout URL from MercadoPago.');
    }

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (error) {
    console.error('[MercadoPago][Appointment] Fatal error creating preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

    return new NextResponse(
      JSON.stringify({
        ok: false,
        error: 'Failed to create payment preference.',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
