# 🎨 Diseño del Mensaje de Expiración en Login

## Vista Previa del Mensaje

Cuando un usuario con período expirado intenta iniciar sesión, verá este mensaje **ANTES** de los campos de login:

```
┌─────────────────────────────────────────────────────────┐
│  👑  Período de prueba finalizado                       │
│                                                          │
│  Tu período de prueba gratuito de 15 días ha terminado. │
│  Actualiza a Plan Pro para continuar usando SalonFlow.  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✨ Beneficios del Plan Pro:                        │ │
│  │ ✓ Reservas ilimitadas sin restricciones            │ │
│  │ ✓ Notificaciones automáticas por WhatsApp          │ │
│  │ ✓ Soporte prioritario 24/7                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│              $5.000/mes                                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │      💳  Actualizar a Plan Pro                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Características del Diseño

### 🎨 Colores
- **Fondo:** Gradiente de ámbar suave (from-amber-50 to-orange-50)
- **Borde:** Ámbar 200 con 2px de grosor
- **Icono:** Corona dorada en círculo ámbar
- **Botón:** Gradiente primary-600 a accent-600

### 📐 Estructura
1. **Header con icono:**
   - Icono de corona (👑) en círculo de fondo ámbar
   - Título en negrita: "Período de prueba finalizado"
   - Descripción clara del problema

2. **Caja de beneficios:**
   - Fondo blanco para destacar
   - Lista con checkmarks verdes
   - Texto pequeño pero legible

3. **Precio destacado:**
   - Tamaño grande (2xl)
   - Negrita para el monto
   - "/mes" en tamaño y peso menor

4. **Botón de acción:**
   - Ancho completo
   - Gradiente llamativo
   - Icono de tarjeta de crédito
   - Efecto hover con escala y sombra
   - Estado de carga con spinner

### 🔄 Estados del Botón

**Normal:**
```
💳 Actualizar a Plan Pro
```

**Cargando:**
```
⏳ Procesando...
```

### 💡 Comportamiento

1. **Al cargar la página:**
   - Usuario ingresa email y contraseña
   - Hace clic en "Ingresar a mi Salón"
   - Sistema valida credenciales
   - Si el período expiró, muestra el mensaje

2. **Al hacer clic en "Actualizar a Plan Pro":**
   - Botón cambia a estado "Procesando..."
   - Se crea la preferencia de pago en Mercado Pago
   - Redirige automáticamente al checkout
   - Usuario completa el pago
   - Webhook actualiza el plan a "pro"
   - Usuario puede volver a iniciar sesión

3. **Si el usuario escribe de nuevo:**
   - El mensaje desaparece
   - Puede intentar con otras credenciales

### 📱 Responsive

- **Mobile:** El mensaje se adapta al ancho de la pantalla
- **Desktop:** Máximo ancho de 28rem (max-w-md)
- **Tablet:** Se ve correctamente en todos los tamaños

### ♿ Accesibilidad

- Contraste adecuado entre texto y fondo
- Iconos con significado semántico
- Botón con estados claros (normal, hover, disabled)
- Mensajes descriptivos

## 🎯 Objetivo

El mensaje debe:
- ✅ Ser claro y directo sobre el problema
- ✅ Mostrar el valor del Plan Pro
- ✅ Facilitar la conversión con un botón prominente
- ✅ Mantener un tono profesional pero amigable
- ✅ Integrarse visualmente con el resto del diseño

## 🔧 Código Clave

El mensaje se muestra cuando:
```typescript
error === 'trial-expired' && expiredSalon
```

Y se oculta cuando:
```typescript
// Usuario escribe en los campos
handleChange() // Resetea error y expiredSalon
```

---

**Diseño implementado en:** `app/salon/login/page.tsx`
**Fecha:** 2025-11-01
