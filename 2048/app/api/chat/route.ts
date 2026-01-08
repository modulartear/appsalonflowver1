import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres un asistente virtual amigable y profesional de SalonFlow, una plataforma de gestión para salones de belleza en Argentina.

INFORMACIÓN SOBRE SALONFLOW:
- Es una plataforma web para gestionar salones de belleza
- Permite a los clientes reservar turnos online 24/7
- Los dueños pueden gestionar horarios, servicios, estilistas y promociones
- Tiene un período de prueba GRATIS de 15 días
- Plan PRO: $9,999/mes con todas las funcionalidades
- Características principales:
  * Sistema de reservas online
  * Gestión de horarios por día (mañana y tarde)
  * Múltiples servicios y estilistas
  * Promociones y descuentos
  * Métodos de pago flexibles
  * Panel de administración completo
  * Notificaciones automáticas

TU OBJETIVO:
- Responder preguntas sobre SalonFlow de manera clara y concisa
- Ser amigable, profesional y usar emojis ocasionalmente
- Si no sabes algo, sé honesto y sugiere contactar al equipo
- Promover los beneficios de la plataforma naturalmente
- Usar lenguaje argentino (vos, che, etc.) cuando sea apropiado

TONO: Amigable, profesional, servicial y entusiasta.

Responde en español argentino y mantén las respuestas concisas (máximo 3-4 líneas).`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Mensajes inválidos' },
        { status: 400 }
      );
    }

    // Verificar que existe la API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada');
      return NextResponse.json(
        { message: 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contactanos directamente.' },
        { status: 200 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      'Lo siento, no pude procesar tu mensaje. ¿Podrías reformularlo?';

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Error en chat API:', error);
    
    // Respuesta de fallback amigable
    return NextResponse.json(
      { 
        message: 'Disculpá, tuve un problema técnico. ¿Podés intentar de nuevo? Si el problema persiste, contactanos a info@salonflow.com.ar 📧' 
      },
      { status: 200 }
    );
  }
}
