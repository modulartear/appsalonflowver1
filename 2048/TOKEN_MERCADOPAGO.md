# 🔐 Configuración de Token de Mercado Pago

## 📋 Resumen

Se ha implementado la capacidad de configurar tokens de API y información de cuenta para métodos de pago online. Los salones pueden ahora ingresar su token de Mercado Pago (u otras plataformas) y datos de cuenta (CBU, Alias, etc.) directamente en la configuración de métodos de pago.

---

## ✅ Funcionalidades Implementadas

### 1. **Campos Adicionales para Pagos Online**

Cuando el salón configura un método de pago tipo "Online", ahora puede agregar:
- ✅ **Token / API Key**: Para integraciones con plataformas de pago
- ✅ **Información de Cuenta**: CBU, Alias, Email, etc.
- ✅ Ayuda contextual según la plataforma
- ✅ Placeholders específicos para Mercado Pago

### 2. **Detección Inteligente**

El sistema detecta automáticamente:
- ✅ Si el nombre incluye "Mercado Pago"
- ✅ Muestra instrucciones específicas
- ✅ Placeholder con formato de token de MP
- ✅ Link a dónde obtener las credenciales

### 3. **Visualización en Lista**

Los métodos de pago online muestran:
- ✅ Badge "✓ Token configurado" si tiene token
- ✅ Información de cuenta visible
- ✅ Diferenciación visual clara

---

## 🎨 Interfaz de Usuario

### Formulario de Método de Pago Online

```
┌─────────────────────────────────────────────┐
│ Nombre del Método: Mercado Pago             │
│                                             │
│ Tipo: ⚪ Pago Local  ⦿ Pago Online         │
│                                             │
│ Detalles (opcional):                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Pago mediante link de Mercado Pago      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Token / API Key (Mercado Pago):             │
│ ┌─────────────────────────────────────────┐ │
│ │ APP_USR-xxxx-xxxx-xxxx-xxxxxxxxxxxx     │ │
│ └─────────────────────────────────────────┘ │
│ ℹ️ Obtén tu token en: Mercado Pago →       │
│    Tu negocio → Configuración → Credenciales│
│                                             │
│ Información de Cuenta (CBU/Alias/Email):    │
│ ┌─────────────────────────────────────────┐ │
│ │ salon.belleza.mp                        │ │
│ └─────────────────────────────────────────┘ │
│ ℹ️ Información que se mostrará al cliente  │
│    para realizar el pago                    │
└─────────────────────────────────────────────┘
```

### Vista en Lista

```
┌─────────────────────────────────────────────┐
│ Mercado Pago [Pago Online] [✓ Token configurado] │
│ Pago mediante link de Mercado Pago          │
│ Cuenta: salon.belleza.mp                    │
│                                    [Toggle] │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Configuración

### Paso 1: Crear Método de Pago Online

1. Ir a Dashboard → Configuración → Métodos de Pago
2. Clic en "Agregar Método de Pago"
3. Nombre: "Mercado Pago"
4. Tipo: Seleccionar "Pago Online"

### Paso 2: Configurar Token (Mercado Pago)

1. **Obtener Token de Mercado Pago**:
   - Ir a: https://www.mercadopago.com.ar
   - Tu negocio → Configuración → Credenciales
   - Copiar "Access Token" (Producción o Prueba)

2. **Ingresar en SalonFlow**:
   - Pegar token en campo "Token / API Key"
   - Ejemplo: `APP_USR-1234567890123456-123456-1234567890abcdef1234567890abcdef-123456789`

### Paso 3: Configurar Información de Cuenta

1. **Opciones disponibles**:
   - **Email de Mercado Pago**: `salon@email.com`
   - **Alias**: `salon.belleza.mp`
   - **Link personalizado**: `mpago.li/salonbelleza`
   - **CBU/CVU**: Para transferencias

2. **Ingresar en SalonFlow**:
   - Campo "Información de Cuenta"
   - Esta info se mostrará al cliente

### Paso 4: Guardar y Activar

1. Clic en "Agregar"
2. Toggle activado (verde)
3. ✅ Método disponible para clientes

---

## 💻 Implementación Técnica

### Tipo PaymentMethod Actualizado

```typescript
export interface PaymentMethod {
  id: string;
  type: 'local' | 'online';
  name: string;
  active: boolean;
  details?: string;
  token?: string;           // NUEVO - Token de API
  accountInfo?: string;     // NUEVO - Info de cuenta
}
```

### Guardado de Datos

```typescript
const newMethod: PaymentMethod = {
  id: generateUniqueId(),
  name: formData.name,
  type: formData.type,
  details: formData.details,
  token: formData.type === 'online' ? formData.token : undefined,
  accountInfo: formData.type === 'online' ? formData.accountInfo : undefined,
  active: formData.active,
};
```

### Detección de Mercado Pago

```typescript
{formData.name.toLowerCase().includes('mercado pago') && (
  <p className="text-xs text-gray-500 mt-1">
    Obtén tu token en: Mercado Pago → Tu negocio → Configuración → Credenciales
  </p>
)}
```

---

## 📊 Ejemplos de Configuración

### Ejemplo 1: Mercado Pago Completo

```json
{
  "name": "Mercado Pago",
  "type": "online",
  "details": "Pago mediante link de Mercado Pago",
  "token": "APP_USR-1234567890123456-123456-abcdef",
  "accountInfo": "salon.belleza.mp",
  "active": true
}
```

**Vista para el cliente:**
- Método: Mercado Pago (Online)
- Cuenta: salon.belleza.mp

---

### Ejemplo 2: Transferencia Bancaria

```json
{
  "name": "Transferencia Bancaria",
  "type": "online",
  "details": "Transferencia a cuenta del salón",
  "accountInfo": "CBU: 0123456789012345678901 - Alias: SALON.BELLEZA",
  "active": true
}
```

**Vista para el cliente:**
- Método: Transferencia Bancaria (Online)
- Cuenta: CBU: 0123456789012345678901 - Alias: SALON.BELLEZA

---

### Ejemplo 3: PayPal

```json
{
  "name": "PayPal",
  "type": "online",
  "details": "Pago internacional via PayPal",
  "token": "sb-xxxxx-yyyyy@business.example.com",
  "accountInfo": "salon@paypal.com",
  "active": true
}
```

---

## 🎯 Casos de Uso

### Caso 1: Salón con Mercado Pago

**Configuración:**
```
Nombre: Mercado Pago
Token: APP_USR-1234...
Cuenta: salon.belleza.mp
```

**Beneficio:**
- Cliente ve método "Mercado Pago"
- Puede pagar con link personalizado
- Salón recibe pago online automático

---

### Caso 2: Salón con Transferencia

**Configuración:**
```
Nombre: Transferencia
Cuenta: CBU: 0123... - Alias: SALON.BELLEZA
```

**Beneficio:**
- Cliente ve datos de cuenta
- Puede hacer transferencia antes de ir
- Salón confirma pago recibido

---

### Caso 3: Múltiples Métodos Online

**Configuración:**
```
1. Mercado Pago (con token)
2. Transferencia (con CBU)
3. PayPal (con email)
```

**Beneficio:**
- Cliente elige su método preferido
- Salón acepta múltiples formas de pago
- Mayor flexibilidad y conversión

---

## 🔒 Seguridad

### Buenas Prácticas:

1. **Tokens de Producción**:
   - ✅ Usar tokens de producción en ambiente real
   - ✅ Tokens de prueba solo para testing

2. **No Compartir Tokens**:
   - ❌ No compartir tokens públicamente
   - ❌ No incluir en capturas de pantalla

3. **Renovación Periódica**:
   - 🔄 Cambiar tokens cada cierto tiempo
   - 🔄 Revocar tokens comprometidos

4. **Almacenamiento**:
   - 💾 Actualmente en LocalStorage (demo)
   - 🔐 Para producción: Backend seguro

### Advertencias:

⚠️ **IMPORTANTE**: Este sistema es para demostración. En producción:
- Almacenar tokens en backend seguro
- Usar HTTPS siempre
- Encriptar datos sensibles
- Implementar rate limiting
- Logs de acceso a tokens

---

## 🎨 Elementos Visuales

### Badges:

1. **Pago Local**: 
   - Color: Verde (`bg-green-100 text-green-800`)

2. **Pago Online**: 
   - Color: Azul (`bg-blue-100 text-blue-800`)

3. **Token Configurado**: 
   - Color: Púrpura (`bg-purple-100 text-purple-800`)
   - Icono: ✓

### Ayuda Contextual:

```
ℹ️ Texto gris claro (text-xs text-gray-500)
Aparece debajo de campos importantes
Proporciona guía específica
```

---

## 🧪 Casos de Prueba

### Test 1: Agregar Mercado Pago con Token

1. Crear método "Mercado Pago"
2. Tipo: Online
3. Token: `APP_USR-test123`
4. Cuenta: `test.salon.mp`
5. Guardar
6. ✅ Debe mostrar badge "✓ Token configurado"

### Test 2: Editar Token

1. Editar método existente
2. Cambiar token
3. Guardar
4. ✅ Nuevo token debe guardarse

### Test 3: Método Local sin Token

1. Crear método "Efectivo"
2. Tipo: Local
3. ✅ Campos de token NO deben aparecer

### Test 4: Múltiples Métodos Online

1. Crear "Mercado Pago" con token
2. Crear "Transferencia" con CBU
3. ✅ Ambos deben mostrarse correctamente

### Test 5: Desactivar Método

1. Desactivar método con token
2. ✅ No debe aparecer para clientes
3. ✅ Token debe conservarse

---

## 📱 Responsive

### Mobile:
- Campos apilados verticalmente
- Texto de ayuda legible
- Tokens con scroll horizontal si es necesario

### Tablet:
- Campos en grid 1 columna
- Espaciado adecuado

### Desktop:
- Campos en grid 1 columna
- Máximo ancho para legibilidad

---

## 🚀 Próximas Mejoras

### Corto Plazo:
- [ ] Validación de formato de token
- [ ] Test de conexión con API
- [ ] Indicador de token válido/inválido
- [ ] Ocultar token (mostrar solo últimos 4 caracteres)

### Mediano Plazo:
- [ ] Integración real con Mercado Pago API
- [ ] Generación automática de links de pago
- [ ] Webhook para confirmación de pagos
- [ ] Dashboard de transacciones

### Largo Plazo:
- [ ] Múltiples tokens por salón
- [ ] Rotación automática de tokens
- [ ] Integración con más plataformas
- [ ] Sistema de facturación automática

---

## 📚 Recursos Útiles

### Mercado Pago:
- **Documentación**: https://www.mercadopago.com.ar/developers
- **Credenciales**: https://www.mercadopago.com.ar/settings/account/credentials
- **API Reference**: https://www.mercadopago.com.ar/developers/es/reference

### Otras Plataformas:
- **PayPal**: https://developer.paypal.com
- **Stripe**: https://stripe.com/docs/api
- **Transferencias**: Consultar con banco

---

## ✅ Checklist de Configuración

- [ ] Obtener token de Mercado Pago
- [ ] Copiar token en configuración
- [ ] Ingresar información de cuenta
- [ ] Agregar detalles descriptivos
- [ ] Activar método de pago
- [ ] Probar reserva como cliente
- [ ] Verificar que info se muestra correctamente

---

**Fecha de implementación**: Octubre 2025  
**Versión**: 2.3.0  
**Estado**: ✅ Completado y Funcional

¡El sistema de tokens está listo para integrar pagos online! 🔐💳
