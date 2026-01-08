import nodemailer from 'nodemailer';
import twilio from 'twilio';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  EMAIL_SECURE,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  NOTIFICATIONS_DEFAULT_COUNTRY_CODE,
} = process.env as Record<string, string | undefined>;

// Lazy singletons
let mailTransport: nodemailer.Transporter | null = null;
let twilioClient: twilio.Twilio | null = null;

function getMailTransport(): nodemailer.Transporter | null {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
    console.warn('[notifications] Email transport not configured (missing envs)');
    return null;
  }
  if (!mailTransport) {
    mailTransport = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE ? EMAIL_SECURE === 'true' : Number(EMAIL_PORT) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
  return mailTransport;
}

function getTwilioClient(): twilio.Twilio | null {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn('[notifications] Twilio client not configured (missing envs)');
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

export async function sendEmail(params: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
  const transport = getMailTransport();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return true;
  } catch (err) {
    console.error('[notifications] Error sending email:', err);
    return false;
  }
}

function toWhatsAppAddress(rawPhone: string): string | null {
  // Normalize to E.164 with default country code if missing
  const defaultCode = NOTIFICATIONS_DEFAULT_COUNTRY_CODE || '+54';
  let digits = rawPhone.replace(/[^0-9+]/g, '');
  if (!digits.startsWith('+')) {
    // Prepend default country code
    if (!digits.startsWith('0')) {
      digits = `${defaultCode}${digits}`;
    } else {
      digits = `${defaultCode}${digits.substring(1)}`;
    }
  }
  // Ensure starts with +
  if (!/^\+\d{7,15}$/.test(digits)) {
    console.warn('[notifications] Invalid phone for WhatsApp:', rawPhone);
    return null;
  }
  return `whatsapp:${digits}`;
}

export async function sendWhatsApp(params: { to: string; body: string }): Promise<boolean> {
  const client = getTwilioClient();
  if (!client) return false;
  const from = TWILIO_WHATSAPP_FROM!; // e.g., 'whatsapp:+14155238886'
  const to = toWhatsAppAddress(params.to);
  if (!to) return false;
  try {
    await client.messages.create({ from, to, body: params.body });
    return true;
  } catch (err) {
    console.error('[notifications] Error sending WhatsApp:', err);
    return false;
  }
}

export function buildAppointmentEmailHtml(data: {
  salonName: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  promotion?: string;
  finalPrice?: number;
}): string {
  const priceLine = data.finalPrice !== undefined ? `<p><strong>Total:</strong> $${data.finalPrice.toLocaleString()}</p>` : '';
  const promoLine = data.promotion ? `<p><strong>Promoción:</strong> ${data.promotion}</p>` : '';
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111">
      <h2 style="color:#0ea5e9;">Confirmación de Reserva</h2>
      <p>Hola ${data.clientName},</p>
      <p>Tu turno ha sido reservado exitosamente en <strong>${data.salonName}</strong>.</p>
      <p>
        <strong>Servicio:</strong> ${data.service}<br/>
        <strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString('es-AR')}<br/>
        <strong>Hora:</strong> ${data.time}
      </p>
      ${promoLine}
      ${priceLine}
      <p>Gracias por elegirnos.</p>
    </div>
  `;
}

export function buildAppointmentWhatsappText(data: {
  salonName: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  promotion?: string;
  finalPrice?: number;
  paymentMethod?: string;
  paymentLink?: string;
}): string {
  const parts = [
    `¡Hola ${data.clientName}! 👋`,
    ``,
    `✅ Tu turno en *${data.salonName}* ha sido confirmado.`,
    ``,
    `📅 *Detalles de tu reserva:*`,
    `• Servicio: ${data.service}`,
    `• Fecha: ${new Date(data.date).toLocaleDateString('es-AR')}`,
    `• Hora: ${data.time}`,
  ];
  
  if (data.promotion) {
    parts.push(`• Promoción: ${data.promotion} 🎉`);
  }
  
  if (data.finalPrice !== undefined) {
    parts.push(`• Total: $${data.finalPrice.toLocaleString()}`);
  }
  
  // Si el método de pago NO es online y hay un link de pago, ofrecer pago anticipado
  if (data.paymentMethod && !data.paymentMethod.toLowerCase().includes('online') && data.paymentLink) {
    parts.push(``);
    parts.push(`💳 *Pago Anticipado (Opcional):*`);
    parts.push(`Si deseas pagar ahora de forma online, puedes hacerlo aquí:`);
    parts.push(data.paymentLink);
    parts.push(``);
    parts.push(`También puedes pagar en el salón como elegiste.`);
  }
  
  parts.push(``);
  parts.push(`¡Te esperamos! 🙌`);
  parts.push(`Gracias por elegirnos ✨`);
  
  return parts.join('\n');
}
