// Script de prueba para verificar la configuración de Twilio WhatsApp
// Ejecutar con: node test-twilio.js

require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  NOTIFICATIONS_DEFAULT_COUNTRY_CODE,
} = process.env;

console.log('🔍 Verificando configuración de Twilio...\n');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log('✓ TWILIO_ACCOUNT_SID:', TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ Falta');
console.log('✓ TWILIO_AUTH_TOKEN:', TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ Falta');
console.log('✓ TWILIO_WHATSAPP_FROM:', TWILIO_WHATSAPP_FROM ? `✅ ${TWILIO_WHATSAPP_FROM}` : '❌ Falta');
console.log('✓ NOTIFICATIONS_DEFAULT_COUNTRY_CODE:', NOTIFICATIONS_DEFAULT_COUNTRY_CODE || '+54');
console.log('');

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
  console.error('❌ Error: Faltan variables de entorno de Twilio');
  console.log('\nConfigura las siguientes variables en tu archivo .env.local:');
  console.log('- TWILIO_ACCOUNT_SID');
  console.log('- TWILIO_AUTH_TOKEN');
  console.log('- TWILIO_WHATSAPP_FROM');
  console.log('\nConsulta CONFIGURACION_TWILIO_WHATSAPP.md para más información.');
  process.exit(1);
}

// Verificar formato de TWILIO_WHATSAPP_FROM
if (!TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')) {
  console.error('❌ Error: TWILIO_WHATSAPP_FROM debe comenzar con "whatsapp:"');
  console.log(`   Valor actual: ${TWILIO_WHATSAPP_FROM}`);
  console.log(`   Valor correcto: whatsapp:${TWILIO_WHATSAPP_FROM}`);
  process.exit(1);
}

// Crear cliente de Twilio
console.log('📱 Creando cliente de Twilio...');
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Función para normalizar número de teléfono
function toWhatsAppAddress(rawPhone) {
  const defaultCode = NOTIFICATIONS_DEFAULT_COUNTRY_CODE || '+54';
  let digits = rawPhone.replace(/[^0-9+]/g, '');
  
  if (!digits.startsWith('+')) {
    if (!digits.startsWith('0')) {
      digits = `${defaultCode}${digits}`;
    } else {
      digits = `${defaultCode}${digits.substring(1)}`;
    }
  }
  
  if (!/^\+\d{7,15}$/.test(digits)) {
    console.warn('⚠️  Formato de teléfono inválido:', rawPhone);
    return null;
  }
  
  return `whatsapp:${digits}`;
}

// Solicitar número de teléfono para prueba
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n📞 Prueba de envío de WhatsApp');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  IMPORTANTE: El número debe estar activado en el Sandbox de Twilio');
console.log('   Para activarlo, envía el código de activación al número de Twilio');
console.log('   Ejemplo: "join abc-xyz" al +1 415 523 8886');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

readline.question('Ingresa el número de WhatsApp para probar (ej: 1123456789): ', async (phoneNumber) => {
  readline.close();
  
  if (!phoneNumber || phoneNumber.trim() === '') {
    console.log('❌ No se ingresó ningún número. Prueba cancelada.');
    process.exit(0);
  }
  
  const whatsappNumber = toWhatsAppAddress(phoneNumber);
  
  if (!whatsappNumber) {
    console.error('❌ Número de teléfono inválido');
    process.exit(1);
  }
  
  console.log(`\n📤 Enviando mensaje de prueba a: ${whatsappNumber}`);
  console.log(`   Desde: ${TWILIO_WHATSAPP_FROM}`);
  
  const testMessage = `¡Hola! 👋\n\nEste es un mensaje de prueba de SalonFlow.\n\nSi recibiste este mensaje, ¡la configuración de Twilio WhatsApp está funcionando correctamente! ✅\n\nFecha: ${new Date().toLocaleString('es-AR')}`;
  
  try {
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: whatsappNumber,
      body: testMessage
    });
    
    console.log('\n✅ ¡Mensaje enviado exitosamente!');
    console.log(`   Message SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Fecha de envío: ${message.dateCreated}`);
    console.log('\n📱 Revisa tu WhatsApp para ver el mensaje.');
    console.log('\n💡 Tip: Si no recibes el mensaje, verifica:');
    console.log('   1. Que hayas activado el Sandbox enviando el código de activación');
    console.log('   2. Que el número esté en formato correcto');
    console.log('   3. Los logs en Twilio Console: Monitor → Logs → Messaging');
    
  } catch (error) {
    console.error('\n❌ Error al enviar mensaje:');
    console.error(`   ${error.message}`);
    
    if (error.code === 20003) {
      console.log('\n💡 Error de autenticación. Verifica:');
      console.log('   - TWILIO_ACCOUNT_SID es correcto');
      console.log('   - TWILIO_AUTH_TOKEN es correcto');
    } else if (error.code === 21211) {
      console.log('\n💡 Número inválido. Verifica:');
      console.log('   - El número está activado en el Sandbox de Twilio');
      console.log('   - El formato del número es correcto');
    } else if (error.code === 21606) {
      console.log('\n💡 El número FROM no es válido. Verifica:');
      console.log('   - TWILIO_WHATSAPP_FROM tiene el formato: whatsapp:+1234567890');
      console.log('   - Estás usando el número correcto del Sandbox');
    }
    
    console.log('\n📚 Más información en: CONFIGURACION_TWILIO_WHATSAPP.md');
    process.exit(1);
  }
});
