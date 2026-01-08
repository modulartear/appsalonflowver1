# Configuración de Twilio WhatsApp para SalonFlow

Esta guía te ayudará a configurar el envío de notificaciones por WhatsApp usando Twilio.

## 📋 Requisitos Previos

1. Una cuenta de Twilio (puedes crear una cuenta de prueba gratuita)
2. Acceso a tu archivo `.env.local`

## 🚀 Pasos de Configuración

### 1. Crear Cuenta en Twilio

1. Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Regístrate con tu email
3. Verifica tu número de teléfono
4. Completa el cuestionario inicial

### 2. Obtener Credenciales de Twilio

Una vez dentro del Dashboard de Twilio:

1. En la página principal, encontrarás:
   - **Account SID**: Tu identificador de cuenta (ejemplo: `ACxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token**: Tu token de autenticación (haz clic en "Show" para verlo)

2. Copia estos valores, los necesitarás para el `.env.local`

### 3. Configurar WhatsApp Sandbox (Para Pruebas)

Twilio ofrece un "Sandbox" de WhatsApp para pruebas sin necesidad de aprobación de Meta:

1. En el menú lateral de Twilio, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un número de WhatsApp de Twilio (ejemplo: `+1 415 523 8886`)
3. Verás un código de activación (ejemplo: `join abc-xyz`)

#### Activar el Sandbox en tu WhatsApp:

1. Abre WhatsApp en tu teléfono
2. Agrega el número de Twilio a tus contactos
3. Envía el mensaje con el código de activación (ejemplo: `join abc-xyz`)
4. Recibirás un mensaje de confirmación

**Importante**: Cada persona que quiera recibir mensajes debe hacer este proceso de activación.

### 4. Configurar Variables de Entorno

Edita tu archivo `.env.local` y agrega:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NOTIFICATIONS_DEFAULT_COUNTRY_CODE=+54
```

**Explicación de cada variable:**

- `TWILIO_ACCOUNT_SID`: Tu Account SID de Twilio
- `TWILIO_AUTH_TOKEN`: Tu Auth Token de Twilio
- `TWILIO_WHATSAPP_FROM`: El número de WhatsApp de Twilio en formato `whatsapp:+1234567890`
  - Para Sandbox: usa el número que te dio Twilio (ejemplo: `whatsapp:+14155238886`)
  - Para producción: usa tu número aprobado
- `NOTIFICATIONS_DEFAULT_COUNTRY_CODE`: Código de país por defecto (Argentina: `+54`)

### 5. Configurar en Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las 4 variables de Twilio
4. Selecciona los entornos: Production, Preview, Development
5. Guarda y redeploy

### 6. Probar el Envío

Una vez configurado:

1. Asegúrate de que tu número de WhatsApp esté activado en el Sandbox
2. Crea una reserva en tu aplicación
3. Deberías recibir un mensaje de WhatsApp con la confirmación

## 📱 Formato de Números de Teléfono

La aplicación acepta números en varios formatos y los normaliza automáticamente:

- `1123456789` → Se convierte a `+541123456789`
- `01123456789` → Se convierte a `+541123456789`
- `+541123456789` → Se mantiene igual

## 🔄 Migrar de Sandbox a Producción

Para usar WhatsApp en producción (sin el Sandbox):

### 1. Solicitar un Número de WhatsApp Business

1. En Twilio Console: **Messaging** → **Senders** → **WhatsApp senders**
2. Haz clic en "Request to enable your Twilio number for WhatsApp"
3. Completa el formulario de Meta (Facebook)
4. Espera la aprobación (puede tomar varios días)

### 2. Configurar Plantillas de Mensajes

Meta requiere que uses plantillas pre-aprobadas para mensajes:

1. En Twilio: **Messaging** → **Content Templates**
2. Crea una plantilla para confirmación de reservas
3. Espera aprobación de Meta

### 3. Actualizar el Código

Si usas plantillas, necesitarás modificar `lib/notifications.ts` para usar el sistema de plantillas de Twilio.

## 💰 Costos

### Sandbox (Gratis)
- Ilimitado para pruebas
- Solo funciona con números que se unan al Sandbox

### Producción
- Aproximadamente $0.005 USD por mensaje enviado
- Varía según el país de destino
- Consulta precios actualizados en: [https://www.twilio.com/whatsapp/pricing](https://www.twilio.com/whatsapp/pricing)

## 🐛 Solución de Problemas

### Error: "The number is not a valid WhatsApp number"
- Verifica que el número esté activado en el Sandbox
- Asegúrate de que el formato sea correcto

### Error: "Unable to create record: The 'From' number is not a valid WhatsApp-enabled number"
- Verifica que `TWILIO_WHATSAPP_FROM` tenga el prefijo `whatsapp:`
- Ejemplo correcto: `whatsapp:+14155238886`

### No recibo mensajes
- Verifica que hayas enviado el código de activación al Sandbox
- Revisa los logs de Twilio en: **Monitor** → **Logs** → **Messaging**
- Verifica que las variables de entorno estén configuradas correctamente

### Error: "Authenticate"
- Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
- Asegúrate de no tener espacios extra al copiar/pegar

## 📞 Soporte

- Documentación oficial de Twilio WhatsApp: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Soporte de Twilio: [https://support.twilio.com](https://support.twilio.com)

## ✅ Checklist de Configuración

- [ ] Cuenta de Twilio creada
- [ ] Account SID y Auth Token obtenidos
- [ ] Sandbox de WhatsApp activado
- [ ] Número de prueba agregado y código de activación enviado
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Aplicación redeployada
- [ ] Prueba de envío realizada exitosamente

---

**Nota**: Para producción, considera usar un servicio de WhatsApp Business API oficial o Twilio con número aprobado por Meta.
