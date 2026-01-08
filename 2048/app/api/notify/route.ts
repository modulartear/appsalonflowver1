import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendWhatsApp, buildAppointmentEmailHtml, buildAppointmentWhatsappText } from '@/lib/notifications';

// Ensure this route runs on the Node.js runtime (required for nodemailer and Twilio)
export const runtime = 'nodejs';
// Disable static optimization/caching for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      salon,
      client,
      service,
      date,
      time,
      promotion,
      finalPrice,
      paymentMethod,
      appointmentId,
    } = body as {
      salon: { name: string; email?: string; phone?: string; id?: string };
      client: { name: string; email?: string; phone?: string };
      service: string;
      date: string;
      time: string;
      promotion?: string;
      finalPrice?: number;
      paymentMethod?: string;
      appointmentId?: string;
    };

    const emailHtml = buildAppointmentEmailHtml({
      salonName: salon.name,
      clientName: client.name,
      service,
      date,
      time,
      promotion,
      finalPrice,
    });

    // Execute in parallel, ignore failures
    const tasks: Promise<any>[] = [];

    if (client.email) {
      tasks.push(
        sendEmail({
          to: client.email,
          subject: `Reserva confirmada - ${salon.name}`,
          html: emailHtml,
        })
      );
    }

    if (salon.email) {
      tasks.push(
        sendEmail({
          to: salon.email,
          subject: `Nueva reserva - ${client.name}`,
          html: emailHtml,
        })
      );
    }

    // Generar link de pago si es necesario
    let paymentLink: string | undefined;
    if (appointmentId && salon.id && paymentMethod && !paymentMethod.toLowerCase().includes('online')) {
      // Construir URL completa para el pago
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      paymentLink = `${baseUrl}/payment/${appointmentId}`;
    }

    const waText = buildAppointmentWhatsappText({
      salonName: salon.name,
      clientName: client.name,
      service,
      date,
      time,
      promotion,
      finalPrice,
      paymentMethod,
      paymentLink,
    });

    if (client.phone) {
      tasks.push(sendWhatsApp({ to: client.phone, body: waText }));
    }

    if (salon.phone) {
      tasks.push(
        sendWhatsApp({
          to: salon.phone,
          body: `Nueva reserva: ${client.name} - ${service} - ${date} ${time}`,
        })
      );
    }

    await Promise.allSettled(tasks);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notify] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to send notifications' }, { status: 500 });
  }
}
