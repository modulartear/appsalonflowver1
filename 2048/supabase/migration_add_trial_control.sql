-- Migración: Agregar control de período de prueba
-- Fecha: 2025-11-01
-- Descripción: Agrega campos para controlar el acceso basado en el período de prueba de 15 días

-- Agregar columna is_active para controlar el estado del salón
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Agregar columna trial_end_date para almacenar la fecha de fin del período de prueba
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Comentarios descriptivos
COMMENT ON COLUMN salons.is_active IS 'Indica si el salón tiene acceso activo a la plataforma';
COMMENT ON COLUMN salons.trial_end_date IS 'Fecha de finalización del período de prueba (15 días para plan free)';

-- Actualizar salones existentes con trial_end_date basado en plan_start_date
UPDATE salons 
SET trial_end_date = plan_start_date + INTERVAL '15 days'
WHERE plan = 'free' AND trial_end_date IS NULL;

UPDATE salons 
SET trial_end_date = plan_start_date + INTERVAL '30 days'
WHERE plan = 'pro' AND trial_end_date IS NULL;

-- Crear función para verificar si el período de prueba ha expirado
CREATE OR REPLACE FUNCTION check_trial_expired()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el plan es 'free' y han pasado más de 15 días, desactivar
  IF NEW.plan = 'free' AND NEW.trial_end_date IS NOT NULL AND NOW() > NEW.trial_end_date THEN
    NEW.is_active = false;
  END IF;
  
  -- Si el plan es 'pro', mantener activo
  IF NEW.plan = 'pro' THEN
    NEW.is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para verificar expiración en cada actualización
CREATE TRIGGER trigger_check_trial_expired
BEFORE UPDATE ON salons
FOR EACH ROW
EXECUTE FUNCTION check_trial_expired();

-- Crear índice para mejorar consultas de salones activos
CREATE INDEX IF NOT EXISTS idx_salons_is_active ON salons(is_active);
CREATE INDEX IF NOT EXISTS idx_salons_trial_end_date ON salons(trial_end_date);
