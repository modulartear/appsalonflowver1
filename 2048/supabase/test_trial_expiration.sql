-- Script de prueba para el sistema de expiración de período de prueba
-- Ejecuta estos comandos en el SQL Editor de Supabase para probar

-- ============================================
-- 1. CREAR UN SALÓN DE PRUEBA CON PERÍODO EXPIRADO
-- ============================================

-- Primero, eliminar el salón de prueba si existe
DELETE FROM salons WHERE email = 'prueba-expirado@salonflow.com';

-- Crear salón con período expirado (hace 16 días)
INSERT INTO salons (
  name, 
  owner_name, 
  email, 
  password_hash, 
  phone, 
  address, 
  plan, 
  plan_start_date, 
  is_active, 
  trial_end_date
)
VALUES (
  'Salón Prueba Expirado',
  'Usuario Prueba',
  'prueba-expirado@salonflow.com',
  '$2a$10$YourHashedPasswordHere', -- Reemplazar con hash real o usar bcrypt
  '1234567890',
  'Calle Falsa 123, Ciudad',
  'free',
  NOW() - INTERVAL '16 days',  -- Empezó hace 16 días
  false,                         -- Inactivo
  NOW() - INTERVAL '1 day'       -- Expiró ayer
);

-- Verificar que se creó correctamente
SELECT 
  id,
  name, 
  email, 
  plan,
  is_active,
  plan_start_date,
  trial_end_date,
  EXTRACT(DAY FROM (NOW() - trial_end_date)) as dias_desde_expiracion
FROM salons 
WHERE email = 'prueba-expirado@salonflow.com';

-- ============================================
-- 2. CREAR UN SALÓN DE PRUEBA QUE EXPIRA HOY
-- ============================================

DELETE FROM salons WHERE email = 'prueba-expira-hoy@salonflow.com';

INSERT INTO salons (
  name, 
  owner_name, 
  email, 
  password_hash, 
  phone, 
  address, 
  plan, 
  plan_start_date, 
  is_active, 
  trial_end_date
)
VALUES (
  'Salón Expira Hoy',
  'Usuario Prueba 2',
  'prueba-expira-hoy@salonflow.com',
  '$2a$10$YourHashedPasswordHere',
  '0987654321',
  'Avenida Siempre Viva 742, Ciudad',
  'free',
  NOW() - INTERVAL '15 days',  -- Empezó hace 15 días
  true,                          -- Aún activo
  NOW()                          -- Expira hoy
);

-- ============================================
-- 3. CREAR UN SALÓN DE PRUEBA CON DÍAS RESTANTES
-- ============================================

DELETE FROM salons WHERE email = 'prueba-activo@salonflow.com';

INSERT INTO salons (
  name, 
  owner_name, 
  email, 
  password_hash, 
  phone, 
  address, 
  plan, 
  plan_start_date, 
  is_active, 
  trial_end_date
)
VALUES (
  'Salón Activo',
  'Usuario Prueba 3',
  'prueba-activo@salonflow.com',
  '$2a$10$YourHashedPasswordHere',
  '5551234567',
  'Boulevard Principal 456, Ciudad',
  'free',
  NOW() - INTERVAL '5 days',   -- Empezó hace 5 días
  true,                          -- Activo
  NOW() + INTERVAL '10 days'     -- Le quedan 10 días
);

-- ============================================
-- 4. CREAR UN SALÓN CON PLAN PRO (NUNCA EXPIRA)
-- ============================================

DELETE FROM salons WHERE email = 'prueba-pro@salonflow.com';

INSERT INTO salons (
  name, 
  owner_name, 
  email, 
  password_hash, 
  phone, 
  address, 
  plan, 
  plan_start_date, 
  is_active, 
  trial_end_date
)
VALUES (
  'Salón Pro',
  'Usuario Pro',
  'prueba-pro@salonflow.com',
  '$2a$10$YourHashedPasswordHere',
  '5559876543',
  'Calle Premium 789, Ciudad',
  'pro',
  NOW() - INTERVAL '20 days',   -- Empezó hace 20 días
  true,                           -- Siempre activo
  NOW() + INTERVAL '10 days'      -- Fecha de renovación
);

-- ============================================
-- 5. VER RESUMEN DE TODOS LOS SALONES DE PRUEBA
-- ============================================

SELECT 
  name,
  email,
  plan,
  is_active,
  plan_start_date::date as inicio,
  trial_end_date::date as fin,
  CASE 
    WHEN trial_end_date < NOW() THEN 'EXPIRADO'
    WHEN trial_end_date::date = NOW()::date THEN 'EXPIRA HOY'
    ELSE 'ACTIVO'
  END as estado,
  CASE 
    WHEN trial_end_date > NOW() THEN 
      EXTRACT(DAY FROM (trial_end_date - NOW()))::integer
    ELSE 
      -EXTRACT(DAY FROM (NOW() - trial_end_date))::integer
  END as dias_restantes
FROM salons
WHERE email LIKE 'prueba-%@salonflow.com'
ORDER BY trial_end_date DESC;

-- ============================================
-- 6. SIMULAR ACTUALIZACIÓN A PLAN PRO
-- ============================================

-- Para simular que un salón expirado actualiza a Pro:
UPDATE salons 
SET 
  plan = 'pro',
  is_active = true,
  plan_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '30 days'
WHERE email = 'prueba-expirado@salonflow.com';

-- Verificar el cambio
SELECT 
  name,
  email,
  plan,
  is_active,
  trial_end_date,
  EXTRACT(DAY FROM (trial_end_date - NOW()))::integer as dias_restantes
FROM salons
WHERE email = 'prueba-expirado@salonflow.com';

-- ============================================
-- 7. LIMPIAR DATOS DE PRUEBA
-- ============================================

-- Ejecutar esto cuando termines las pruebas:
/*
DELETE FROM salons WHERE email LIKE 'prueba-%@salonflow.com';
*/

-- ============================================
-- 8. CONSULTAS ÚTILES PARA MONITOREO
-- ============================================

-- Ver todos los salones que expiran en los próximos 3 días
SELECT 
  name,
  email,
  plan,
  trial_end_date::date as expira,
  EXTRACT(DAY FROM (trial_end_date - NOW()))::integer as dias_restantes
FROM salons
WHERE 
  plan = 'free' 
  AND trial_end_date > NOW()
  AND trial_end_date < NOW() + INTERVAL '3 days'
ORDER BY trial_end_date ASC;

-- Ver todos los salones expirados
SELECT 
  name,
  email,
  is_active,
  trial_end_date::date as expiro,
  EXTRACT(DAY FROM (NOW() - trial_end_date))::integer as dias_expirado
FROM salons
WHERE 
  plan = 'free' 
  AND trial_end_date < NOW()
ORDER BY trial_end_date DESC;

-- Ver estadísticas generales
SELECT 
  plan,
  COUNT(*) as total,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as activos,
  SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as inactivos,
  SUM(CASE WHEN trial_end_date < NOW() AND plan = 'free' THEN 1 ELSE 0 END) as expirados
FROM salons
GROUP BY plan;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. Para probar el login, necesitas generar un hash bcrypt real de la contraseña.
   Puedes usar: https://bcrypt-generator.com/
   O ejecutar en Node.js:
   
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('tu-password', 10);
   console.log(hash);

2. Reemplaza '$2a$10$YourHashedPasswordHere' con el hash generado.

3. Para probar el flujo completo:
   - Crea el salón de prueba con período expirado
   - Intenta hacer login en la app
   - Deberías ver el mensaje con el botón "Actualizar a Plan Pro"
   - Haz clic en el botón
   - Completa el pago en Mercado Pago (modo sandbox)
   - El webhook actualizará el plan automáticamente

4. Los salones con plan 'pro' siempre tienen is_active = true
   gracias al trigger creado en la migración.
*/
