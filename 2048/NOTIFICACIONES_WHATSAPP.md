# 📱 Notificaciones Automáticas de WhatsApp - SalonFlow

## 🎯 Descripción

Sistema de notificaciones automáticas que envía mensajes de WhatsApp a los clientes cuando realizan una reserva. El mensaje incluye:

- ✅ Confirmación de la reserva
- 📅 Detalles del turno (fecha, hora, servicio)
- 💰 Precio total y promociones aplicadas
- 💳 **Link de pago online** (si eligió pagar en el salón)

---

## ✨ Características Principales

### **1. Notificación Automática al Cliente**

Cuando un cliente reserva un turno, recibe automáticamente un WhatsApp con:

```
¡Hola Juan! 👋

✅ Tu turno en *Bella Estética* ha sido confirmado.

📅 *Detalles de tu reserva:*
• Servicio: Corte de cabello
• Fecha: 15/11/2025
• Hora: 14:30
• Promoción: 20% OFF Martes 🎉
• Total: $8,000

💳 *Pago Anticipado (Opcional):*
Si deseas pagar ahora de forma online, puedes hacerlo aquí:
https://salonflow.com/payment/abc123

También puedes pagar en el salón como elegiste.

¡Te esperamos! 🙌
Gracias por elegirnos ✨
```

### **2. Notificación al Salón**

El salón también recibe un WhatsApp con la nueva reserva:

```
Nueva reserva: Juan Pérez - Corte de cabello - 2025-11-15 14:30
```

### **3. Link de Pago Inteligente**

El link de pago **solo se incluye** si:
- ✅ El cliente eligió un método de pago **local** (efectivo, transferencia en el salón, etc.)
- ✅ El turno tiene un precio definido
- ✅ Se generó correctamente el ID de la reserva

**No se incluye** si:
- ❌ El cliente ya eligió pagar online (ya pagó)
- ❌ El servicio es gratuito

---

## 🔧 Implementación Técnica

### **Archivos Modificados/Creados**

#### **1. `lib/notifications.ts`**
Función actualizada para construir mensajes de WhatsApp:

```typescript
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
}): string
```

**Cambios**:
- ✅ Agregados parámetros `paymentMethod` y `paymentLink`
- ✅ Lógica condicional para mostrar link de pago
- ✅ Formato mejorado con emojis y negritas (WhatsApp markdown)

#### **2. `app/api/notify/route.ts`**
API route que envía las notificaciones:

```typescript
export async function POST(req: NextRequest)
```

**Cambios**:
- ✅ Recibe `paymentMethod` y `appointmentId`
- ✅ Genera link de pago dinámicamente
- ✅ Envía WhatsApp con link incluido

**Parámetros esperados**:
```typescript
{
  salon: { 
    id: string,
    name: string, 
    email?: string, 
    phone?: string 
  },
  client: { 
    name: string, 
    email?: string, 
    phone?: string 
  },
  service: string,
  date: string,
  time: string,
  promotion?: string,
  finalPrice?: number,
  paymentMethod?: string,
  appointmentId?: string
}
```

#### **3. `app/client/book/[id]/page.tsx`**
Página de reserva actualizada:

**Cambios**:
- ✅ Envía `appointmentId` a la API de notificaciones
- ✅ Envía `salonId` para construir el link
- ✅ Envía `paymentMethod` para decidir si incluir link

---

## 🚀 Configuración

### **1. Variables de Entorno Requeridas**

Agrega a tu `.env.local`:

```env
# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NOTIFICATIONS_DEFAULT_COUNTRY_CODE=+54
```

**Explicación**:
- `NEXT_PUBLIC_BASE_URL`: URL base de tu app (en producción: `https://tudominio.com`)
- `TWILIO_ACCOUNT_SID`: Tu Account SID de Twilio
- `TWILIO_AUTH_TOKEN`: Tu Auth Token de Twilio
- `TWILIO_WHATSAPP_FROM`: Número de WhatsApp de Twilio (con prefijo `whatsapp:`)
- `NOTIFICATIONS_DEFAULT_COUNTRY_CODE`: Código de país por defecto (Argentina: `+54`)

### **2. Configurar Twilio WhatsApp Sandbox**

Sigue la guía completa en: [`CONFIGURACION_TWILIO_WHATSAPP.md`](./CONFIGURACION_TWILIO_WHATSAPP.md)

**Pasos rápidos**:
1. Crear cuenta en [Twilio](https://www.twilio.com/try-twilio)
2. Ir a **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Copiar el número de WhatsApp de Twilio
4. Enviar el código de activación desde tu WhatsApp
5. Configurar variables de entorno
6. ¡Listo para probar!

### **3. Configurar en Vercel (Producción)**

1. Ir a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agregar todas las variables de entorno
4. Seleccionar entornos: **Production**, **Preview**, **Development**
5. Guardar y redesplegar

---

## 🔄 Flujo de Notificaciones

```
1. Cliente completa formulario de reserva
   ↓
2. Se guarda la reserva en Supabase
   ↓
3. Se obtiene el ID de la reserva (appointmentId)
   ↓
4. Se llama a /api/notify con todos los datos
   ↓
5. API genera link de pago (si aplica)
   ↓
6. API construye mensaje de WhatsApp
   ↓
7. Se envía WhatsApp al cliente (con link de pago)
   ↓
8. Se envía WhatsApp al salón (notificación simple)
   ↓
9. Se envían emails (cliente y salón)
   ↓
10. Cliente recibe confirmación por WhatsApp
```

---

## 💳 Link de Pago

### **Formato del Link**

```
https://tudominio.com/payment/{appointmentId}
```

**Ejemplo**:
```
https://salonflow.vercel.app/payment/550e8400-e29b-41d4-a716-446655440000
```

### **Cuándo se Incluye**

El link de pago se incluye **solo si**:

```typescript
if (appointmentId && salon.id && paymentMethod && !paymentMethod.toLowerCase().includes('online')) {
  // Generar link de pago
}
```

**Condiciones**:
1. ✅ Existe `appointmentId` (reserva guardada exitosamente)
2. ✅ Existe `salon.id` (salón válido)
3. ✅ Existe `paymentMethod` (método de pago seleccionado)
4. ✅ El método de pago **NO** contiene "online" (no pagó todavía)

### **Métodos de Pago que Incluyen Link**

- ✅ Efectivo en el salón
- ✅ Transferencia en el salón
- ✅ Tarjeta en el salón
- ✅ Cualquier método local

### **Métodos de Pago que NO Incluyen Link**

- ❌ MercadoPago (Online)
- ❌ Stripe (Online)
- ❌ Cualquier método que contenga "online" en el nombre

---

## 📱 Formato de Números de Teléfono

La app normaliza automáticamente los números de teléfono:

| Formato Ingresado | Formato Enviado a WhatsApp |
|-------------------|----------------------------|
| `1123456789`      | `whatsapp:+541123456789`   |
| `01123456789`     | `whatsapp:+541123456789`   |
| `+541123456789`   | `whatsapp:+541123456789`   |

**Código de país por defecto**: `+54` (Argentina)

Puedes cambiarlo en `.env.local`:
```env
NOTIFICATIONS_DEFAULT_COUNTRY_CODE=+1  # USA
NOTIFICATIONS_DEFAULT_COUNTRY_CODE=+52 # México
NOTIFICATIONS_DEFAULT_COUNTRY_CODE=+34 # España
```

---

## 🧪 Pruebas

### **Prueba Local**

1. **Configurar Sandbox de Twilio**:
   - Activar tu número en el Sandbox
   - Enviar código de activación

2. **Crear una reserva de prueba**:
   - Ir a la página de reserva de un salón
   - Completar el formulario con tu número de WhatsApp
   - Seleccionar un método de pago **local** (ej: "Efectivo")
   - Confirmar la reserva

3. **Verificar**:
   - ✅ Deberías recibir un WhatsApp con la confirmación
   - ✅ El mensaje debe incluir el link de pago
   - ✅ El link debe tener formato: `http://localhost:3000/payment/{id}`

### **Prueba en Producción**

1. **Configurar variables en Vercel**
2. **Redesplegar la app**
3. **Crear reserva de prueba**
4. **Verificar**:
   - ✅ Link debe tener formato: `https://tudominio.com/payment/{id}`
   - ✅ Link debe ser accesible públicamente

---

## 🐛 Solución de Problemas

### **No recibo WhatsApp**

**Posibles causas**:
1. ❌ Número no activado en Sandbox de Twilio
2. ❌ Variables de entorno incorrectas
3. ❌ Formato de número incorrecto

**Solución**:
1. Verificar que enviaste el código de activación al Sandbox
2. Revisar variables en `.env.local` o Vercel
3. Revisar logs en Twilio Console: **Monitor** → **Logs** → **Messaging**

### **El link de pago no aparece**

**Posibles causas**:
1. ❌ Elegiste un método de pago "online"
2. ❌ No se configuró `NEXT_PUBLIC_BASE_URL`
3. ❌ Error al guardar la reserva (no hay `appointmentId`)

**Solución**:
1. Verificar que el método de pago sea local (ej: "Efectivo")
2. Agregar `NEXT_PUBLIC_BASE_URL` a `.env.local`
3. Revisar consola del navegador para errores

### **Error: "The number is not a valid WhatsApp number"**

**Causa**: El número no está activado en el Sandbox

**Solución**:
1. Abrir WhatsApp
2. Enviar mensaje al número de Twilio con el código de activación
3. Esperar confirmación
4. Intentar nuevamente

### **Error: "Unable to create record"**

**Causa**: `TWILIO_WHATSAPP_FROM` no tiene el prefijo `whatsapp:`

**Solución**:
```env
# ❌ Incorrecto
TWILIO_WHATSAPP_FROM=+14155238886

# ✅ Correcto
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 💰 Costos

### **Sandbox (Desarrollo)**
- ✅ **Gratis** e ilimitado
- ⚠️ Solo funciona con números activados en el Sandbox

### **Producción (WhatsApp Business API)**
- 💵 Aproximadamente **$0.005 USD** por mensaje
- 📊 Varía según el país de destino
- 📈 Consulta precios: [Twilio WhatsApp Pricing](https://www.twilio.com/whatsapp/pricing)

**Ejemplo de costos**:
- 100 reservas/mes = $0.50 USD
- 1,000 reservas/mes = $5 USD
- 10,000 reservas/mes = $50 USD

---

## 🔐 Seguridad

### **Buenas Prácticas**

1. ✅ **No exponer credenciales**: Usar variables de entorno
2. ✅ **Validar números**: La app valida formato antes de enviar
3. ✅ **Manejo de errores**: Los errores no bloquean la reserva
4. ✅ **Rate limiting**: Twilio tiene límites automáticos

### **Privacidad**

- 🔒 Los números de teléfono se normalizan pero no se almacenan en formato especial
- 🔒 Las notificaciones se envían de forma asíncrona (no bloquean la reserva)
- 🔒 Los errores de envío se registran pero no se muestran al usuario

---

## 📊 Métricas y Monitoreo

### **Twilio Console**

Puedes monitorear tus mensajes en:
1. Ir a [Twilio Console](https://console.twilio.com)
2. **Monitor** → **Logs** → **Messaging**
3. Ver todos los mensajes enviados, entregados y fallidos

### **Métricas Disponibles**

- 📨 Mensajes enviados
- ✅ Mensajes entregados
- ❌ Mensajes fallidos
- 💰 Costo por mensaje
- 📊 Tasa de entrega

---

## 🚀 Próximas Mejoras

1. **Recordatorios automáticos**:
   - Enviar WhatsApp 24hs antes del turno
   - Enviar WhatsApp 1 hora antes del turno

2. **Confirmación de asistencia**:
   - Botones interactivos en WhatsApp
   - "Confirmar" o "Cancelar" turno

3. **Plantillas aprobadas**:
   - Migrar a WhatsApp Business API oficial
   - Usar plantillas pre-aprobadas por Meta

4. **Notificaciones de cambios**:
   - Avisar si el salón cancela/modifica el turno
   - Avisar si el cliente cancela

5. **Estadísticas en dashboard**:
   - Ver tasa de entrega de WhatsApp
   - Ver cuántos clientes pagan por el link

---

## ✅ Checklist de Implementación

- [x] Función `buildAppointmentWhatsappText` actualizada
- [x] API route `/api/notify` actualizada
- [x] Página de reserva actualizada
- [x] Variables de entorno documentadas
- [x] Link de pago generado dinámicamente
- [x] Documentación completa creada
- [ ] Configurar Twilio Sandbox (usuario)
- [ ] Agregar variables de entorno (usuario)
- [ ] Probar envío de WhatsApp (usuario)
- [ ] Configurar en Vercel (usuario)
- [ ] Probar en producción (usuario)

---

## 📞 Soporte

- **Documentación Twilio**: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Soporte Twilio**: [https://support.twilio.com](https://support.twilio.com)
- **Guía de configuración**: [`CONFIGURACION_TWILIO_WHATSAPP.md`](./CONFIGURACION_TWILIO_WHATSAPP.md)

---

**Fecha de Implementación**: 2025-11-01  
**Versión**: 2.0.0  
**Archivos Modificados**:
- `lib/notifications.ts`
- `app/api/notify/route.ts`
- `app/client/book/[id]/page.tsx`
- `.env.local.example`

**Estado**: ✅ Implementado y listo para configurar
