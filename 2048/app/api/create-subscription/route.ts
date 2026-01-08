import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Ensure this route runs on the Node.js runtime
export const runtime = 'nodejs';

const { MERCADOPAGO_ACCESS_TOKEN } = process.env;


export async function POST(req: NextRequest) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'MercadoPago is not configured on the server.' },
      { status: 500 }
    );
  }

  const { salonId, salonName, payerEmail, payerName } = await req.json();

  if (!salonId || !salonName) {
    return NextResponse.json({ ok: false, error: 'Salon ID and name are required.' }, { status: 400 });
  }

  if (!payerEmail) {
    return NextResponse.json({ ok: false, error: 'Payer email is required.' }, { status: 400 });
  }

  const proPlanPrice = 49000.00; // Precio del Plan Pro en ARS
  const backUrlBase = req.nextUrl.origin;

  const preference = {
    items: [
      {
        id: 'pro-plan',
        title: `Suscripción Plan Pro - ${salonName}`,
        description: 'Acceso a todas las funcionalidades avanzadas de SalonFlow.',
        quantity: 1,
        unit_price: proPlanPrice,
        currency_id: 'ARS',
      },
    ],
    payer: {
      email: payerEmail,
      name: payerName || salonName,
    },
    back_urls: {
      success: `${backUrlBase}/payment/success?salon_id=${salonId}`,
      failure: `${backUrlBase}/payment/failure?salon_id=${salonId}`,
      pending: `${backUrlBase}/payment/pending?salon_id=${salonId}`,
    },
    auto_return: 'approved',
    notification_url: `${backUrlBase}/api/webhooks/mercadopago?source_news=ipn`,
    external_reference: salonId, // Usamos el ID del salón para identificar el pago
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
    console.error('[MercadoPago] Fatal error creating preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Ensure a JSON response is always sent on error
    return new NextResponse(JSON.stringify({
      ok: false,
      error: 'Failed to create payment preference.',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
