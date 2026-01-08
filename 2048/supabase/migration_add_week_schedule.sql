-- Migración: Agregar columna week_schedule a la tabla salons
-- Fecha: 2025-11-01
-- Descripción: Agrega soporte para horarios personalizados por día de la semana

-- Agregar columna week_schedule si no existe
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS week_schedule JSONB;

-- Comentario descriptivo
COMMENT ON COLUMN salons.week_schedule IS 'Horarios de atención por día de la semana en formato JSON. Estructura: [{day: number, dayName: string, isOpen: boolean, morning: {start: string, end: string}, afternoon: {start: string, end: string}}]';
