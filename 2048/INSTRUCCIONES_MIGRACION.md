# Instrucciones para Aplicar el Control de Período de Prueba

## 📋 Resumen
Se ha implementado un sistema completo para controlar y limitar el acceso de los dueños de salón cuando se les terminan los 15 días de prueba gratuita.

## 🗄️ Migración de Base de Datos

### Paso 1: Aplicar la migración SQL
Ejecuta el siguiente archivo SQL en tu base de datos Supabase:

```bash
supabase/migration_add_trial_control.sql
```

O copia y pega el contenido directamente en el SQL Editor de Supabase.

Esta migración:
- ✅ Agrega el campo `is_active` (BOOLEAN) para controlar el estado del salón
- ✅ Agrega el campo `trial_end_date` (TIMESTAMP) para almacenar la fecha de fin del período
- ✅ Actualiza los salones existentes con sus fechas de fin de prueba
- ✅ Crea una función y trigger para verificar automáticamente la expiración
- ✅ Crea índices para mejorar el rendimiento

### Paso 2: Verificar la migración
Ejecuta esta consulta para verificar que los campos se agregaron correctamente:

```sql
SELECT id, name, plan, is_active, trial_end_date, plan_start_date 
FROM salons 
LIMIT 5;
```

## 🎯 Funcionalidades Implementadas

### 1. **Verificación en el Login** (`app/salon/login/page.tsx`)
- Verifica si el salón está activo (`isActive`)
- Verifica si el período de prueba ha expirado
- Muestra mensajes de error específicos si el acceso está bloqueado

### 2. **Modal de Período Expirado** (`components/TrialExpiredModal.tsx`)
- Componente flotante que se muestra cuando el período expira
- Muestra los beneficios del Plan Pro
- Botón para actualizar a Plan Pro con integración a Mercado Pago
- Diseño moderno y atractivo

### 3. **Control en el Dashboard** (`app/salon/dashboard/[id]/page.tsx`)
- Verifica automáticamente el estado del período al cargar
- Muestra el modal si el período ha expirado
- Bloquea la interacción con un overlay si está expirado
- Calcula y muestra los días restantes del período de prueba

### 4. **Actualización de Tipos** (`lib/types.ts`)
- Agregados campos `isActive` y `trialEndDate` a la interfaz `Salon`

### 5. **Actualización de API** (`lib/api.ts`)
- `saveSalon`: Calcula y guarda automáticamente la fecha de fin de prueba
- `updateSalonPlan`: Reactiva el salón y actualiza la fecha al cambiar a Plan Pro
- `dbSalonToAppSalon`: Mapea los nuevos campos de la base de datos

### 6. **Registro de Salones** (`app/salon/register/page.tsx`)
- Incluye los nuevos campos al crear un salón
- Calcula automáticamente la fecha de fin de prueba (15 días)

## 🔄 Flujo de Usuario

### Cuando el período de prueba expira:

1. **En el Login:**
   - El usuario intenta iniciar sesión
   - El sistema verifica si el período expiró
   - Muestra un mensaje destacado con:
     - Icono de corona y título "Período de prueba finalizado"
     - Explicación clara del estado
     - Lista de beneficios del Plan Pro
     - Precio mensual ($5.000/mes)
     - **Botón "Actualizar a Plan Pro"** que redirige a Mercado Pago
   - Bloquea el acceso al dashboard hasta que actualice

2. **En el Dashboard (si ya estaba dentro):**
   - Se muestra un modal flotante automáticamente
   - El modal explica que el período expiró
   - Muestra los beneficios del Plan Pro
   - Ofrece botón "Actualizar a Plan Pro"
   - Un overlay bloquea la interacción con el dashboard

3. **Al hacer clic en "Actualizar a Plan Pro":**
   - Redirige a Mercado Pago para procesar el pago
   - Después del pago exitoso, el webhook actualiza el plan a "pro"
   - El salón se reactiva automáticamente (`is_active = true`)
   - Se actualiza la fecha de fin del período a 30 días

## 🧪 Pruebas

### Para probar el sistema:

1. **Crear un salón de prueba:**
   ```sql
   INSERT INTO salons (name, owner_name, email, password_hash, phone, address, plan, plan_start_date, is_active, trial_end_date)
   VALUES (
     'Salón Prueba',
     'Test User',
     'test@example.com',
     '$2a$10$example_hash',
     '1234567890',
     'Dirección de prueba',
     'free',
     NOW() - INTERVAL '16 days',  -- Hace 16 días
     false,
     NOW() - INTERVAL '1 day'     -- Expiró ayer
   );
   ```

2. **Intentar iniciar sesión** con ese salón para ver el bloqueo

3. **Simular reactivación:**
   ```sql
   UPDATE salons 
   SET plan = 'pro', 
       is_active = true, 
       trial_end_date = NOW() + INTERVAL '30 days'
   WHERE email = 'test@example.com';
   ```

## 📊 Monitoreo

### Consulta para ver salones que expiran pronto:
```sql
SELECT 
  name, 
  email, 
  plan,
  is_active,
  trial_end_date,
  EXTRACT(DAY FROM (trial_end_date - NOW())) as dias_restantes
FROM salons
WHERE 
  plan = 'free' 
  AND trial_end_date > NOW()
  AND EXTRACT(DAY FROM (trial_end_date - NOW())) <= 3
ORDER BY trial_end_date ASC;
```

### Consulta para ver salones expirados:
```sql
SELECT 
  name, 
  email, 
  plan,
  is_active,
  trial_end_date
FROM salons
WHERE 
  plan = 'free' 
  AND (trial_end_date < NOW() OR is_active = false)
ORDER BY trial_end_date DESC;
```

## ⚙️ Configuración Adicional

### Variables de entorno necesarias:
Asegúrate de tener configuradas en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
```

## 🚀 Despliegue

1. Aplica la migración SQL en producción
2. Despliega el código actualizado
3. Verifica que los salones existentes tengan sus fechas de fin de prueba
4. Monitorea los logs para cualquier error

## 📝 Notas Importantes

- Los salones con plan "pro" siempre tienen `is_active = true`
- Los salones con plan "free" se desactivan automáticamente al expirar
- El trigger SQL verifica la expiración en cada actualización
- El frontend también verifica en tiempo real al cargar el dashboard
- El sistema es compatible con la integración existente de Mercado Pago

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que la migración se aplicó correctamente
2. Revisa los logs del navegador (Console)
3. Verifica los logs de Supabase
4. Contacta al equipo de desarrollo

---

**Fecha de implementación:** 2025-11-01
**Versión:** 2.3.0
