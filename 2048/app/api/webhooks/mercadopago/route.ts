import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateSalonPlan } from '@/lib/api';

// Ensure this route runs on the Node.js runtime
export const runtime = 'nodejs';

const { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET } = process.env;

export async function POST(req: NextRequest) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, error: 'MercadoPago is not configured.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');

    // Basic validation
    if (!body || body.type !== 'payment' || !body.data || !body.data.id) {
      return NextResponse.json({ ok: false, error: 'Invalid notification body' }, { status: 400 });
    }

    // TODO: Implement signature validation for production security
    // if (MERCADOPAGO_WEBHOOK_SECRET && signature && requestId) {
    //   const validationBody = `id:${body.data.id};request-id:${requestId}`;
    //   const computedSignature = crypto.createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET).update(validationBody).digest('hex');
    //   if (computedSignature !== signature.split(',')[1].split('=')[1]) {
    //     return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 403 });
    //   }
    // }

    const paymentId = body.data.id;
    
    // Initialize MercadoPago client with the new SDK API
    const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
    const paymentApi = new Payment(client);
    
    const payment = await paymentApi.get({ id: paymentId });

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found.`);
    }

    if (payment.status === 'approved') {
      const salonId = payment.external_reference;
      if (!salonId) {
        throw new Error(`Payment ${paymentId} is missing external_reference (salonId).`);
      }

      console.log(`Payment approved for salonId: ${salonId}. Updating plan to 'pro'.`);

      // Update salon plan in the database
      const success = await updateSalonPlan(salonId, 'pro');

      if (!success) {
        throw new Error(`Failed to update plan for salonId: ${salonId}`);
      }
    }

    // Acknowledge receipt to MercadoPago
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[MercadoPago Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
