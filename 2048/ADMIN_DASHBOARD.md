# Dashboard de Administración - SalonFlow

## 🔐 Acceso

**URL**: `/admin/login`

**Credenciales**:
- **Usuario**: `jgiordano42`
- **Contraseña**: `Caseros305`

## 📊 Funcionalidades

### **Panel Principal** (`/admin/dashboard`)

El dashboard muestra métricas completas de todos los salones registrados en la plataforma.

### **Métricas Generales**

1. **Total Salones**
   - Cantidad total de salones registrados
   - Cantidad de salones activos (no expirados)

2. **Facturación Mensual**
   - Estimación de ingresos del mes actual
   - Basado en cantidad de turnos × precio promedio ($5,000)

3. **Total Turnos**
   - Suma de todos los turnos de todos los salones
   - Incluye turnos completados y pendientes

4. **Turnos por Salón**
   - Promedio de turnos por salón
   - Indicador de actividad general

### **Tabla de Salones**

Para cada salón registrado se muestra:

#### **Información Básica**
- Nombre del salón
- Email de contacto

#### **Estado**
- 🟢 **PRO**: Salón con plan pago activo
- 🔵 **Prueba**: Salón en período de prueba (15 días)
- 🔴 **Expirado**: Período de prueba finalizado

#### **Métricas Temporales**
- **Días Registrado**: Tiempo desde que se registró el salón
- **Días Prueba Restantes**: 
  - Para salones en prueba: días restantes (15 días totales)
  - Para salones PRO: N/A
  - Para salones expirados: "Expirado"
  - Código de colores:
    - 🟢 Verde: > 7 días restantes
    - 🟠 Naranja: 4-7 días restantes
    - 🔴 Rojo: ≤ 3 días restantes

#### **Métricas de Actividad**
- **Turnos**: Total de turnos reservados (histórico)
- **Facturación Mensual**: Estimación de ingresos del mes actual

#### **Acciones Disponibles**
- **Habilitar PRO**: Botón disponible para salones expirados
  - Convierte el salón a plan PRO inmediatamente
  - Reinicia la fecha de inicio del plan
  - Requiere confirmación antes de ejecutar
- **Activar PRO**: Botón disponible para salones en período de prueba
  - Permite convertir un salón de prueba a PRO antes de que expire
  - Útil para salones que quieren actualizar anticipadamente
- **Ya es PRO**: Indicador para salones que ya tienen plan PRO activo

## 🔒 Seguridad

### **Autenticación**
- Credenciales hardcodeadas en el código
- Sesión guardada en `localStorage`
- Redirección automática si no está autenticado

### **Protección de Rutas**
- `/admin/login`: Página pública de login
- `/admin/dashboard`: Requiere autenticación
- Verificación en cada carga de página

### **Cierre de Sesión**
- Botón "Cerrar Sesión" en el header
- Limpia `localStorage` y redirige a login

## 📈 Cálculos y Estimaciones

### **Días Registrado**
```typescript
const registrationDate = new Date(salon.planStartDate);
const now = new Date();
const daysRegistered = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
```

### **Días Prueba Restantes**
```typescript
const trialEndDate = new Date(registrationDate);
trialEndDate.setDate(trialEndDate.getDate() + 15); // 15 días de prueba
const trialDaysRemaining = getDaysRemainingInTrial(trialEndDate);
```

### **Facturación Mensual**
```typescript
// Filtrar turnos del mes actual
const monthlyAppointments = appointments.filter(apt => {
  const aptDate = new Date(apt.date);
  return aptDate.getMonth() === currentMonth && 
         aptDate.getFullYear() === currentYear &&
         apt.status !== 'cancelled';
});

// Calcular revenue (precio promedio: $5,000 por servicio)
const avgServicePrice = 5000;
const monthlyRevenue = monthlyAppointments.length * avgServicePrice;
```

## 🎨 Interfaz

### **Diseño**
- Header con logo y botón de logout
- Cards de métricas generales (4 cards)
- Tabla responsive con todos los salones
- Colores según estado y urgencia

### **Responsive**
- Desktop: 4 columnas de cards
- Tablet: 2 columnas de cards
- Mobile: 1 columna de cards
- Tabla con scroll horizontal en móviles

### **Iconos**
- 🏪 Store: Total salones
- 💰 DollarSign: Facturación
- 📅 Calendar: Turnos
- 📈 TrendingUp: Promedios
- ✅ CheckCircle: Plan PRO
- ⏰ Clock: En prueba
- ⚠️ AlertTriangle: Expirado
- 🔓 Unlock: Habilitar/Activar PRO

## 🔧 Archivos Creados

1. **`app/admin/login/page.tsx`**
   - Página de login con formulario
   - Validación de credenciales
   - Guardado de sesión

2. **`app/admin/dashboard/page.tsx`**
   - Dashboard principal
   - Carga de datos de salones
   - Cálculo de métricas
   - Tabla con información detallada

3. **`lib/api.ts`** (modificado)
   - Agregado `getAllSalons` (alias de `getSalons`)

## 📱 Uso

### **Acceso Inicial**
1. Navegar a `/admin/login`
2. Ingresar usuario: `jgiordano42`
3. Ingresar contraseña: `Caseros305`
4. Click en "Iniciar Sesión"

### **Navegación**
- Dashboard se carga automáticamente tras login exitoso
- Datos se actualizan al cargar la página
- Botón "Cerrar Sesión" en esquina superior derecha

### **Interpretación de Datos**

**Salón Saludable**:
- Estado: PRO o Prueba
- Días prueba restantes: > 7 (verde)
- Turnos: > 10
- Facturación: > $50,000

**Salón en Riesgo**:
- Estado: Prueba
- Días prueba restantes: ≤ 3 (rojo)
- Turnos: < 5
- Facturación: < $20,000

**Salón Inactivo**:
- Estado: Expirado
- Turnos: 0 o muy pocos
- Facturación: $0

## ✅ Funcionalidades Implementadas

### **Gestión de Planes**
- ✅ **Habilitar salones expirados**: Botón para convertir salones expirados a plan PRO
- ✅ **Activar PRO anticipadamente**: Botón para convertir salones en prueba a PRO
- ✅ **Confirmación de acción**: Diálogo de confirmación antes de cambiar el plan
- ✅ **Actualización automática**: La tabla se recarga después de habilitar un salón
- ✅ **Feedback visual**: Alertas de éxito o error al ejecutar la acción

### **Cómo Usar la Función de Habilitar**

1. **Identificar salón a habilitar**:
   - Buscar salones con estado "Expirado" (badge rojo)
   - O salones en "Prueba" que quieras convertir anticipadamente

2. **Hacer click en el botón**:
   - "Habilitar PRO" (verde) para salones expirados
   - "Activar PRO" (azul) para salones en prueba

3. **Confirmar la acción**:
   - Se mostrará un diálogo de confirmación
   - Verificar el nombre del salón
   - Confirmar para proceder

4. **Verificar el cambio**:
   - El salón cambiará a estado "PRO" (badge verde)
   - La fecha de inicio del plan se actualizará
   - "Días Prueba Restantes" mostrará "N/A (PRO)"

## 🚀 Mejoras Futuras

1. **Filtros y Búsqueda**
   - Filtrar por estado (PRO/Prueba/Expirado)
   - Buscar por nombre o email
   - Ordenar por columnas

2. **Gráficos**
   - Gráfico de crecimiento de salones
   - Gráfico de facturación mensual
   - Distribución de planes

3. **Exportación**
   - Exportar tabla a CSV/Excel
   - Generar reportes PDF

4. **Notificaciones**
   - Alertas de salones próximos a expirar
   - Notificaciones de nuevos registros

5. **Acciones Adicionales**
   - Extender período de prueba manualmente
   - Desactivar/suspender salones
   - Enviar emails masivos
   - Ver historial de cambios de plan

## 🔐 Seguridad en Producción

**IMPORTANTE**: Para producción, se recomienda:

1. Mover credenciales a variables de entorno
2. Implementar autenticación con JWT
3. Agregar rate limiting
4. Implementar 2FA (autenticación de dos factores)
5. Logs de acceso al dashboard
6. Encriptar datos sensibles

---

**Desarrollado**: 2025-11-01  
**Versión**: 1.0.0  
**Acceso**: Solo administrador
