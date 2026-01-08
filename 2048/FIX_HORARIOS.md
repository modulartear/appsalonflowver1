# 🔧 Fix: Horarios de Reserva - Solución Completa

## 🐛 Problema Identificado

Los horarios configurados al crear un salón **no se estaban guardando ni mostrando** en la página de reserva de turnos. El usuario reportó que solo veía horarios hasta las 17:30 independientemente de la configuración del salón.

### Causa Raíz

La tabla `salons` en Supabase **no tenía una columna para almacenar los horarios por día de la semana** (`week_schedule`). Aunque el código frontend permitía configurar horarios personalizados, estos no se guardaban en la base de datos.

---

## ✅ Solución Implementada

### 1. **Actualización del Esquema de Base de Datos**

Se agregó la columna `week_schedule` de tipo `JSONB` a la tabla `salons`:

```sql
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS week_schedule JSONB;
```

### 2. **Actualización de Funciones de API**

Se modificaron 3 funciones en `lib/api.ts`:

#### a) `saveSalon` - Guardar horarios al crear salón
```typescript
week_schedule: salon.weekSchedule || null, // Guardar horarios por día
```

#### b) `updateSalon` - Actualizar horarios existentes
```typescript
if (updatedData.weekSchedule !== undefined) updatePayload.week_schedule = updatedData.weekSchedule;
```

#### c) `dbSalonToAppSalon` - Mapear horarios al recuperar datos
```typescript
weekSchedule: dbSalon.week_schedule || [], // Mapear horarios por día
```

---

## 🚀 Cómo Aplicar la Migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ir a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Navegar a **SQL Editor**
3. Ejecutar el siguiente script:

```sql
-- Agregar columna week_schedule
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS week_schedule JSONB;

-- Agregar comentario descriptivo
COMMENT ON COLUMN salons.week_schedule IS 'Horarios de atención por día de la semana en formato JSON';
```

4. Click en **Run** para ejecutar

### Opción 2: Desde la Terminal

```bash
# Conectarse a Supabase y ejecutar la migración
psql -h [TU_HOST] -U postgres -d postgres -f supabase/migration_add_week_schedule.sql
```

---

## 🔄 Migrar Datos Existentes (Opcional)

Si tienes salones ya creados que usan horarios legacy, puedes migrarlos con este script:

```sql
-- Migrar salones existentes con horarios por defecto
UPDATE salons 
SET week_schedule = '[
  {"day": 1, "dayName": "Lunes", "isOpen": true, "morning": {"start": "08:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "20:00"}},
  {"day": 2, "dayName": "Martes", "isOpen": true, "morning": {"start": "08:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "20:00"}},
  {"day": 3, "dayName": "Miércoles", "isOpen": true, "morning": {"start": "08:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "20:00"}},
  {"day": 4, "dayName": "Jueves", "isOpen": true, "morning": {"start": "08:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "20:00"}},
  {"day": 5, "dayName": "Viernes", "isOpen": true, "morning": {"start": "08:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "20:00"}},
  {"day": 6, "dayName": "Sábado", "isOpen": false, "morning": {"start": "09:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "18:00"}},
  {"day": 0, "dayName": "Domingo", "isOpen": false, "morning": {"start": "09:00", "end": "13:00"}, "afternoon": {"start": "14:00", "end": "18:00"}}
]'::jsonb
WHERE week_schedule IS NULL;
```

---

## 🧪 Verificación

### 1. Verificar que la columna existe

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salons' AND column_name = 'week_schedule';
```

Resultado esperado:
```
column_name    | data_type
---------------+-----------
week_schedule  | jsonb
```

### 2. Verificar datos de un salón

```sql
SELECT id, name, week_schedule 
FROM salons 
LIMIT 1;
```

### 3. Probar en la aplicación

1. **Crear un nuevo salón** con horarios personalizados
2. **Ir a la página de reserva** del salón
3. **Verificar** que los horarios mostrados coincidan con los configurados

---

## 📋 Checklist de Verificación

- [ ] Migración SQL ejecutada en Supabase
- [ ] Código actualizado y desplegado
- [ ] Crear un salón de prueba con horarios personalizados
- [ ] Verificar que los horarios se guardan correctamente
- [ ] Verificar que los horarios se muestran en la página de reserva
- [ ] Verificar que los slots de tiempo se generan correctamente
- [ ] Probar reservar un turno en diferentes horarios

---

## 🎯 Resultado Esperado

Después de aplicar esta solución:

✅ Los horarios configurados al crear/editar un salón se **guardan en la base de datos**  
✅ Los horarios se **recuperan correctamente** al cargar el salón  
✅ La página de reserva muestra **todos los horarios configurados** (mañana y tarde)  
✅ Los clientes pueden reservar turnos en **cualquier horario disponible**  

---

## 📝 Notas Técnicas

### Estructura de `week_schedule` en JSON

```json
[
  {
    "day": 1,
    "dayName": "Lunes",
    "isOpen": true,
    "morning": {
      "start": "08:00",
      "end": "13:00"
    },
    "afternoon": {
      "start": "14:00",
      "end": "20:00"
    }
  }
]
```

- **day**: Número del día (0=Domingo, 1=Lunes, ..., 6=Sábado)
- **dayName**: Nombre del día en español
- **isOpen**: Si el salón atiende ese día
- **morning**: Horario de turno mañana (opcional)
- **afternoon**: Horario de turno tarde (opcional)

### Generación de Slots

La función `generateTimeSlots(start, end)` genera slots cada **30 minutos**:
- Horario: 14:00 - 20:00
- Slots: 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30

El último slot es **30 minutos antes del cierre** para permitir que el turno termine dentro del horario de atención.

---

## 🆘 Soporte

Si después de aplicar la migración sigues teniendo problemas:

1. Verificar que la columna existe en la base de datos
2. Revisar la consola del navegador para errores
3. Verificar que el salón tiene `weekSchedule` configurado
4. Revisar los logs del servidor en Vercel

---

**Fecha de Fix**: 2025-11-01  
**Archivos Modificados**:
- `supabase/schema.sql`
- `supabase/migration_add_week_schedule.sql` (nuevo)
- `lib/api.ts`

**Estado**: ✅ Listo para aplicar
