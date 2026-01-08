# 🎉 Sistema de Promociones para Clientes

## 📋 Resumen

Se ha implementado un sistema automático de detección y aplicación de promociones en la página de reservas del cliente. Cuando un cliente selecciona un servicio o fecha que tiene promociones activas, aparece un popup mostrando los descuentos disponibles.

---

## ✅ Funcionalidades Implementadas

### 1. **Detección Automática de Promociones**

El sistema detecta automáticamente promociones cuando:
- ✅ El cliente selecciona un **servicio** que tiene descuento
- ✅ El cliente selecciona una **fecha** que corresponde a un día con promoción
- ✅ Ambos casos (servicio + día) pueden aplicarse simultáneamente

### 2. **Popup de Promociones**

Cuando hay promociones disponibles:
- ✅ Aparece un **popup modal** automáticamente
- ✅ Muestra todas las promociones aplicables
- ✅ Cada promoción muestra:
  - Nombre de la promoción
  - Porcentaje de descuento
  - Precio original
  - Precio con descuento
  - Botón para aplicar
- ✅ El cliente puede:
  - Seleccionar una promoción
  - Continuar sin promoción

### 3. **Resumen de Precio**

Una vez seleccionado el servicio:
- ✅ Muestra el **precio original** del servicio
- ✅ Si hay promoción aplicada:
  - Precio original tachado
  - Descuento en verde
  - Total a pagar destacado
  - Mensaje confirmando la promoción aplicada

---

## 🎨 Diseño del Popup

### Características Visuales:
- **Fondo oscuro semi-transparente** (overlay)
- **Tarjeta blanca centrada** con sombra
- **Icono de etiqueta verde** en la parte superior
- **Título llamativo**: "🎉 ¡Promociones Disponibles!"
- **Tarjetas de promoción** con:
  - Borde primary que se resalta al hover
  - Badge verde con el porcentaje
  - Comparación de precios
  - Botón de aplicar con gradiente
- **Botón secundario**: "Continuar sin Promoción"

### Animaciones:
- Fade-in del overlay
- Slide-up de la tarjeta
- Hover effects en las tarjetas de promoción

---

## 🔄 Flujo de Usuario

### Escenario 1: Promoción por Servicio

1. Cliente entra a la página de reservas
2. Selecciona un servicio (ej: "Coloración")
3. **Popup aparece automáticamente** si hay descuento
4. Cliente ve: "20% OFF en Coloración"
5. Cliente hace clic en "Aplicar esta Promoción"
6. Popup se cierra
7. Aparece resumen con precio descontado
8. Cliente completa la reserva

### Escenario 2: Promoción por Día

1. Cliente selecciona fecha (ej: Lunes)
2. **Popup aparece** mostrando "Lunes Feliz - 15% OFF"
3. Cliente aplica la promoción
4. Precio se actualiza con descuento
5. Cliente completa la reserva

### Escenario 3: Múltiples Promociones

1. Cliente selecciona servicio con descuento
2. Cliente selecciona día con descuento
3. **Popup muestra ambas promociones**
4. Cliente elige la que más le conviene
5. Solo se aplica una promoción (la seleccionada)

### Escenario 4: Sin Promoción

1. Cliente ve el popup
2. Hace clic en "Continuar sin Promoción"
3. Popup se cierra
4. Precio original se mantiene
5. Cliente completa la reserva normalmente

---

## 💻 Implementación Técnica

### Nuevos Estados

```typescript
const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
const [showPromotionPopup, setShowPromotionPopup] = useState(false);
```

### Detección de Promociones

```typescript
useEffect(() => {
  if (salon && (formData.service || formData.date)) {
    checkAvailablePromotions();
  }
}, [formData.service, formData.date, salon]);
```

La función `checkAvailablePromotions()`:
1. Busca promociones por servicio (si hay servicio seleccionado)
2. Busca promociones por día (si hay fecha seleccionada)
3. Combina y elimina duplicados
4. Muestra popup si hay promociones disponibles

### Cálculo de Precios

```typescript
const getServicePrice = (): number => {
  const service = salon.services.find(s => s.name === formData.service);
  return service?.price || 0;
};

const calculateDiscountedPrice = (promotion: Promotion): number => {
  const originalPrice = getServicePrice();
  const discount = (originalPrice * promotion.discount) / 100;
  return originalPrice - discount;
};
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Descuento en Coloración

**Configuración en Dashboard:**
- Servicio: Coloración - $8000
- Promoción: "Promo Coloración" - 20% OFF

**Experiencia del Cliente:**
```
Servicio seleccionado: Coloración
Precio original: $8,000
Descuento (20%): -$1,600
Total a pagar: $6,400
```

### Ejemplo 2: Lunes con Descuento

**Configuración en Dashboard:**
- Promoción: "Lunes Feliz" - 15% OFF
- Días: Lunes

**Experiencia del Cliente:**
```
Fecha seleccionada: Lunes 15 de Octubre
Servicio: Corte de cabello - $5,000
Descuento (15%): -$750
Total a pagar: $4,250
```

### Ejemplo 3: Doble Promoción

**Configuración en Dashboard:**
- Promoción 1: "Descuento Manicura" - 25% OFF (por servicio)
- Promoción 2: "Martes Especial" - 10% OFF (por día)

**Experiencia del Cliente:**
```
Cliente selecciona: Manicura el Martes

Popup muestra 2 opciones:
1. Descuento Manicura (25% OFF) → $2,250
2. Martes Especial (10% OFF) → $2,700

Cliente elige la opción 1 (mayor descuento)
```

---

## 🎯 Ventajas del Sistema

### Para el Salón:
- ✅ **Aumenta conversiones**: Los descuentos incentivan reservas
- ✅ **Gestión flexible**: Activa/desactiva promociones fácilmente
- ✅ **Días lentos**: Atrae clientes en días con poca demanda
- ✅ **Servicios específicos**: Promociona servicios menos populares

### Para el Cliente:
- ✅ **Transparencia**: Ve claramente el ahorro
- ✅ **Decisión informada**: Compara opciones antes de elegir
- ✅ **Experiencia mejorada**: Popup atractivo y fácil de usar
- ✅ **Flexibilidad**: Puede rechazar la promoción si prefiere

---

## 🔍 Detalles Técnicos

### Detección de Día de la Semana

```typescript
const selectedDate = new Date(formData.date);
const dayOfWeek = selectedDate.getDay(); // 0-6 (Domingo-Sábado)
```

### Filtrado de Promociones

**Por Servicio:**
```typescript
const selectedService = salon.services.find(s => s.name === formData.service);
const servicePromotions = salon.promotions.filter(
  promo => promo.active && 
           promo.type === 'service' && 
           promo.serviceIds?.includes(selectedService.id)
);
```

**Por Día:**
```typescript
const dayPromotions = salon.promotions.filter(
  promo => promo.active && 
           promo.type === 'day' && 
           promo.days?.includes(dayOfWeek)
);
```

### Prevención de Duplicados

```typescript
const uniquePromotions = promotions.filter((promo, index, self) =>
  index === self.findIndex(p => p.id === promo.id)
);
```

---

## 🎨 Componentes Visuales

### Popup Modal

```tsx
{showPromotionPopup && availablePromotions.length > 0 && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      {/* Contenido del popup */}
    </div>
  </div>
)}
```

### Resumen de Precio

```tsx
{formData.service && getServicePrice() > 0 && (
  <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
    {/* Desglose de precio */}
  </div>
)}
```

---

## 🧪 Casos de Prueba

### Test 1: Promoción por Servicio
1. Crear promoción: "Descuento Corte" - 20% OFF - Servicio: Corte
2. Ir a página de reservas
3. Seleccionar servicio "Corte"
4. ✅ Debe aparecer popup con la promoción
5. Aplicar promoción
6. ✅ Precio debe mostrar descuento del 20%

### Test 2: Promoción por Día
1. Crear promoción: "Miércoles Feliz" - 15% OFF - Día: Miércoles
2. Ir a página de reservas
3. Seleccionar cualquier servicio
4. Seleccionar fecha que sea Miércoles
5. ✅ Debe aparecer popup con la promoción
6. Aplicar promoción
7. ✅ Precio debe mostrar descuento del 15%

### Test 3: Sin Promociones
1. Seleccionar servicio sin promoción
2. Seleccionar fecha sin promoción
3. ✅ No debe aparecer popup
4. ✅ Precio debe ser el original

### Test 4: Rechazar Promoción
1. Seleccionar servicio con promoción
2. Popup aparece
3. Clic en "Continuar sin Promoción"
4. ✅ Popup se cierra
5. ✅ Precio original se mantiene

### Test 5: Múltiples Promociones
1. Crear 2 promociones aplicables
2. Seleccionar servicio y fecha que activen ambas
3. ✅ Popup debe mostrar ambas opciones
4. Seleccionar una
5. ✅ Solo esa promoción debe aplicarse

---

## 📱 Responsive

- **Desktop**: Popup centrado, ancho máximo 28rem
- **Tablet**: Popup con padding lateral
- **Mobile**: Popup ocupa casi todo el ancho, con padding de 1rem

---

## 🚀 Próximas Mejoras Sugeridas

### Corto Plazo
- [ ] Permitir aplicar múltiples promociones (acumulables)
- [ ] Historial de promociones usadas por cliente
- [ ] Límite de usos por promoción
- [ ] Código de cupón manual

### Mediano Plazo
- [ ] Promociones por horario (ej: mañanas con descuento)
- [ ] Promociones por primera reserva
- [ ] Promociones por referidos
- [ ] Notificaciones de nuevas promociones

### Largo Plazo
- [ ] Sistema de puntos/fidelidad
- [ ] Promociones personalizadas por cliente
- [ ] A/B testing de promociones
- [ ] Analytics de conversión por promoción

---

## ✅ Checklist de Funcionalidad

- [x] Detección automática de promociones por servicio
- [x] Detección automática de promociones por día
- [x] Popup modal con diseño atractivo
- [x] Múltiples promociones en un popup
- [x] Cálculo correcto de descuentos
- [x] Resumen de precio con desglose
- [x] Opción de rechazar promoción
- [x] Animaciones suaves
- [x] Responsive design
- [x] Prevención de duplicados

---

**Fecha de implementación**: Octubre 2025  
**Versión**: 2.1.0  
**Estado**: ✅ Completado y Funcional

¡El sistema de promociones está listo para aumentar tus reservas! 🎉
