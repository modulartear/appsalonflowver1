# Horarios Personalizados por Día de la Semana (Mañana y Tarde)

## 📋 Descripción

Esta funcionalidad permite a los dueños de salones configurar **horarios específicos para cada día de la semana**, separados en **turno mañana** y **turno tarde**. Los clientes solo podrán reservar turnos en los días y horarios que el salón defina como disponibles.

## ✨ Características Implementadas

### **Para Dueños de Salones**

1. ✅ **Configuración por día**: Define horarios diferentes para cada día de la semana
2. ✅ **Turnos separados**: Configura mañana y tarde independientemente
3. ✅ **Días cerrados**: Marca los días en que el salón no atiende
4. ✅ **Horarios flexibles**: Desde-Hasta para mañana y tarde
5. ✅ **Interfaz visual**: Checkboxes y campos de tiempo con iconos ☀️ y 🌙

### **Para Clientes**

1. ✅ **Horarios dinámicos**: Solo se muestran horarios del día seleccionado
2. ✅ **Días cerrados**: Mensaje claro cuando el salón está cerrado
3. ✅ **Vista de horarios**: Muestra todos los horarios del salón en el sidebar

## 🎯 Ejemplo de Uso

### **Escenario Real**

Un salón trabaja:
- **Lunes**: Cerrado
- **Martes**: 
  - Mañana: 08:00 - 13:00
  - Tarde: 14:00 - 21:00
- **Miércoles**: 
  - Mañana: 08:00 - 13:00
  - Tarde: 14:00 - 20:00
- **Jueves**: 
  - Mañana: 10:00 - 13:00
  - Tarde: 15:00 - 18:00
- **Viernes**: 
  - Mañana: 08:00 - 13:00
  - Tarde: 14:00 - 22:00
- **Sábado**: 
  - Mañana: 09:00 - 13:00
  - Tarde: Cerrado
- **Domingo**: Cerrado

### **Comportamiento del Sistema**

1. **Cliente selecciona Martes**: Ve horarios de 08:00-13:00 y 14:00-21:00
2. **Cliente selecciona Miércoles**: Ve horarios de 08:00-13:00 y 14:00-20:00
3. **Cliente selecciona Sábado**: Ve solo horarios de 09:00-13:00 (sin tarde)
4. **Cliente selecciona Lunes**: Ve mensaje "El salón está cerrado este día"
5. **Cliente selecciona Domingo**: Ve mensaje "El salón está cerrado este día"

## 🔧 Cambios Técnicos Realizados

### **1. Tipos TypeScript (`lib/types.ts`)**

```typescript
export interface TimeSlot {
  start: string; // e.g., "08:00"
  end: string; // e.g., "13:00"
}

export interface DaySchedule {
  day: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayName: string; // "Lunes", "Martes", etc.
  isOpen: boolean; // Si el salón abre ese día
  morning?: TimeSlot; // Horario de mañana (opcional)
  afternoon?: TimeSlot; // Horario de tarde (opcional)
}

export interface Salon {
  // ... otros campos
  weekSchedule?: DaySchedule[]; // Horarios por día con mañana/tarde
}
```

### **2. Formulario de Registro (`app/salon/register/page.tsx`)**

**Estado inicial con turnos mañana/tarde:**
```typescript
const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
  { 
    day: 1, 
    dayName: 'Lunes', 
    isOpen: true, 
    morning: { start: '08:00', end: '13:00' },
    afternoon: { start: '14:00', end: '20:00' }
  },
  // ... resto de días
]);
```

**Función para actualizar horarios mañana/tarde:**
```typescript
const handleScheduleChange = (
  dayIndex: number, 
  field: 'isOpen' | 'morningStart' | 'morningEnd' | 'afternoonStart' | 'afternoonEnd', 
  value: boolean | string
) => {
  setWeekSchedule(prev => prev.map((day, idx) => {
    if (idx !== dayIndex) return day;
    
    if (field === 'isOpen') {
      return { ...day, isOpen: value as boolean };
    }
    
    // Actualizar horarios de mañana
    if (field === 'morningStart') {
      return { ...day, morning: { ...day.morning!, start: value as string }};
    }
    // ... similar para morningEnd, afternoonStart, afternoonEnd
    
    return day;
  }));
};
```

**Validación:**
```typescript
// Validar que al menos un día esté abierto
const hasOpenDay = weekSchedule.some(day => day.isOpen);
if (!hasOpenDay) {
  newErrors.schedule = 'Debes seleccionar al menos un día de atención';
}
```

### **3. Página de Reservas (`app/client/book/[id]/page.tsx`)**

**Función para obtener horarios del día seleccionado:**
```typescript
const getTimeSlotsForSelectedDate = (): string[] => {
  if (!formData.date || !salon) return [];
  
  const selectedDate = new Date(formData.date + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay();
  
  if (salon.weekSchedule && salon.weekSchedule.length > 0) {
    const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
    
    if (daySchedule && daySchedule.isOpen) {
      return generateTimeSlots(daySchedule.start, daySchedule.end);
    } else {
      return []; // Salón cerrado
    }
  }
  
  // Fallback a horarios antiguos
  return generateTimeSlots('09:00', '18:00');
};
```

**Verificar si está cerrado:**
```typescript
const isClosedOnSelectedDate = (): boolean => {
  if (!formData.date || !salon || !salon.weekSchedule) return false;
  const selectedDate = new Date(formData.date + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay();
  const daySchedule = salon.weekSchedule.find(d => d.day === dayOfWeek);
  return daySchedule ? !daySchedule.isOpen : false;
};
```

## 🎨 Interfaz de Usuario

### **Formulario de Registro con Turnos Mañana/Tarde**

```
┌────────────────────────────────────────────────────────────────┐
│ Horarios de Atención por Día                                  │
├────────────────────────────────────────────────────────────────┤
│ ☑ Lunes                                                        │
│   ┌──────────────────────┐  ┌──────────────────────┐         │
│   │ ☀️ Turno Mañana      │  │ 🌙 Turno Tarde       │         │
│   │ Desde: 08:00         │  │ Desde: 14:00         │         │
│   │ Hasta: 13:00         │  │ Hasta: 20:00         │         │
│   └──────────────────────┘  └──────────────────────┘         │
│                                                                │
│ ☑ Martes                                                       │
│   ┌──────────────────────┐  ┌──────────────────────┐         │
│   │ ☀️ Turno Mañana      │  │ 🌙 Turno Tarde       │         │
│   │ Desde: 08:00         │  │ Desde: 14:00         │         │
│   │ Hasta: 13:00         │  │ Hasta: 21:00         │         │
│   └──────────────────────┘  └──────────────────────┘         │
│                                                                │
│ ☐ Domingo                                                      │
│   Cerrado                                                      │
└────────────────────────────────────────────────────────────────┘
```

### **Página de Reservas - Sidebar con Mañana/Tarde**

```
┌──────────────────────────────────┐
│ Días y Horarios:                 │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🕐 Lunes                      │ │
│ │ ☀️ 08:00 - 13:00              │ │
│ │ 🌙 14:00 - 20:00              │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🕐 Martes                     │ │
│ │ ☀️ 08:00 - 13:00              │ │
│ │ 🌙 14:00 - 21:00              │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ✕ Domingo                     │ │
│ │    Cerrado                    │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### **Página de Reservas - Selección de Horario**

**Día abierto con mañana y tarde (Martes):**
```
┌─────────────────────────────────────────┐
│ Horario *                               │
│ Turno Mañana:                           │
│ [08:00] [08:30] [09:00] [09:30] ...    │
│ [10:00] [10:30] [11:00] [11:30] ...    │
│ [12:00] [12:30] [13:00]                │
│                                         │
│ Turno Tarde:                            │
│ [14:00] [14:30] [15:00] [15:30] ...    │
│ [16:00] [16:30] [17:00] [17:30] ...    │
│ [18:00] [18:30] [19:00] [19:30]        │
│ [20:00] [20:30] [21:00]                │
│                                         │
│ 🟢 Disponible  🔴 Ocupado              │
└─────────────────────────────────────────┘
```

**Día cerrado (Domingo):**
```
┌─────────────────────────────────────────┐
│ Horario *                               │
│ ┌─────────────────────────────────────┐ │
│ │ ⚠️ El salón está cerrado este día   │ │
│ │ Por favor selecciona otra fecha     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📊 Flujo de Datos

```
1. Dueño registra salón
   └─> Configura horarios por día
       └─> weekSchedule se guarda en Supabase

2. Cliente accede a página de reservas
   └─> Sistema carga salon.weekSchedule
       └─> Cliente selecciona fecha
           └─> Sistema calcula dayOfWeek
               └─> Busca horario en weekSchedule
                   ├─> Si isOpen = true: Muestra horarios
                   └─> Si isOpen = false: Muestra "Cerrado"
```

## 🔄 Compatibilidad con Versiones Anteriores

El sistema mantiene compatibilidad con salones registrados antes de esta funcionalidad:

```typescript
// Si no hay weekSchedule, usa horarios por defecto
if (salon.weekSchedule && salon.weekSchedule.length > 0) {
  // Usar horarios personalizados
} else {
  // Fallback a 09:00 - 18:00
  return generateTimeSlots('09:00', '18:00');
}
```

## 🧪 Casos de Prueba

### **Test 1: Registro con horarios personalizados**
1. Ir a `/salon/register`
2. Completar formulario
3. Configurar horarios:
   - Martes: 08:00 - 21:00
   - Miércoles: 08:00 - 20:00
   - Resto cerrado
4. Registrar salón
5. ✅ Verificar que `weekSchedule` se guardó correctamente

### **Test 2: Reserva en día abierto**
1. Acceder a página de reservas del salón
2. Seleccionar fecha: Martes
3. ✅ Verificar que aparecen horarios de 08:00 a 21:00
4. Seleccionar horario y completar reserva
5. ✅ Verificar que la reserva se creó correctamente

### **Test 3: Reserva en día cerrado**
1. Acceder a página de reservas del salón
2. Seleccionar fecha: Domingo
3. ✅ Verificar mensaje "El salón está cerrado este día"
4. ✅ Verificar que no aparecen horarios

### **Test 4: Horarios diferentes por día**
1. Acceder a página de reservas
2. Seleccionar Martes (08:00 - 21:00)
3. ✅ Verificar horarios hasta 21:00
4. Cambiar a Miércoles (08:00 - 20:00)
5. ✅ Verificar horarios hasta 20:00

## 🚀 Mejoras Futuras

1. **Horarios de almuerzo**: Permitir definir pausas (ej: 13:00-14:00)
2. **Horarios por estilista**: Cada estilista con su propio horario
3. **Horarios especiales**: Definir horarios para fechas específicas (feriados)
4. **Copiar horarios**: Botón para copiar horario de un día a otros
5. **Plantillas**: Horarios predefinidos (Lun-Vie 9-18, etc.)

## 📝 Notas Importantes

- ✅ Los horarios se generan en intervalos de 30 minutos
- ✅ El sistema usa el día de la semana de la fecha seleccionada
- ✅ Los horarios ocupados se marcan en rojo automáticamente
- ✅ La validación impide registrar salones sin días abiertos
- ✅ El sidebar muestra todos los horarios del salón para referencia

## 🐛 Solución de Problemas

### **Problema: No aparecen horarios**
**Causa**: Fecha no seleccionada o día cerrado
**Solución**: Verificar que la fecha esté seleccionada y que el salón esté abierto ese día

### **Problema: Horarios incorrectos**
**Causa**: weekSchedule no configurado o corrupto
**Solución**: Verificar en la base de datos que weekSchedule tenga el formato correcto

### **Problema: Salones antiguos sin horarios**
**Causa**: Salones registrados antes de esta funcionalidad
**Solución**: El sistema usa fallback a 09:00-18:00 automáticamente

---

**Desarrollado**: 2025-11-01  
**Versión**: 2.4.0
