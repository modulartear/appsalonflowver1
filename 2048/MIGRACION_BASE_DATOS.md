# 🔄 Migración a Base de Datos - SalonFlow

## 📋 Resumen

Se ha implementado una migración completa de **localStorage** a **Supabase (PostgreSQL)** para almacenar todos los datos de la aplicación de forma persistente y escalable.

---

## ✅ Cambios Implementados

### 1. **Nueva Infraestructura**

#### Archivos Creados:

- ✅ `lib/supabase.ts` - Cliente de Supabase
- ✅ `lib/api.ts` - Funciones de API para interactuar con la BD
- ✅ `supabase/schema.sql` - Esquema completo de la base de datos
- ✅ `.env.local.example` - Template de variables de entorno
- ✅ `SUPABASE_SETUP.md` - Guía de configuración

#### Dependencias Instaladas:

```json
{
  "@supabase/supabase-js": "^2.x",
  "bcryptjs": "^2.x",
  "@types/bcryptjs": "^2.x"
}
```

---

## 🗄️ Estructura de la Base de Datos

### Tablas Creadas:

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `salons` | Información de salones | name, email, password_hash, plan |
| `services` | Servicios por salón | name, price, duration, salon_id |
| `stylists` | Estilistas por salón | name, specialties, salon_id |
| `payment_methods` | Métodos de pago | type, name, token, salon_id |
| `promotions` | Promociones activas | type, discount, days, salon_id |
| `appointments` | Reservas de clientes | client_name, date, time, salon_id |

### Características de la BD:

- ✅ **UUIDs** como primary keys
- ✅ **Timestamps** automáticos (created_at, updated_at)
- ✅ **Foreign Keys** con CASCADE delete
- ✅ **Índices** para queries rápidas
- ✅ **Row Level Security** (RLS) habilitado
- ✅ **Triggers** para actualizar updated_at

---

## 🔄 API Nueva vs Antigua

### Antes (localStorage):

```typescript
import { saveSalon, getSalons } from '@/lib/storage';

// Síncrono
const salons = getSalons();
saveSalon(newSalon);
```

### Ahora (Supabase):

```typescript
import { saveSalon, getSalons } from '@/lib/api';

// Asíncrono
const salons = await getSalons();
await saveSalon(newSalon);
```

---

## 📝 Funciones de API Disponibles

### Salons

```typescript
// Guardar nuevo salón
await saveSalon(salon: Omit<Salon, 'id'>): Promise<Salon | null>

// Obtener todos los salones
await getSalons(): Promise<Salon[]>

// Obtener salón por ID (con servicios, estilistas, etc.)
await getSalonById(id: string): Promise<Salon | null>

// Obtener salón por email
await getSalonByEmail(email: string): Promise<Salon | null>

// Actualizar salón
await updateSalon(id: string, data: Partial<Salon>): Promise<boolean>

// Validar credenciales (login)
await validateSalonCredentials(email: string, password: string): Promise<Salon | null>
```

### Services

```typescript
// Obtener servicios de un salón
await getServicesBySalonId(salonId: string): Promise<Service[]>

// Guardar servicios (reemplaza todos)
await saveServices(salonId: string, services: Service[]): Promise<boolean>
```

### Stylists

```typescript
// Obtener estilistas de un salón
await getStylistsBySalonId(salonId: string): Promise<Stylist[]>

// Guardar estilistas (reemplaza todos)
await saveStylists(salonId: string, stylists: Stylist[]): Promise<boolean>
```

### Payment Methods

```typescript
// Obtener métodos de pago de un salón
await getPaymentMethodsBySalonId(salonId: string): Promise<PaymentMethod[]>

// Guardar métodos de pago (reemplaza todos)
await savePaymentMethods(salonId: string, methods: PaymentMethod[]): Promise<boolean>
```

### Promotions

```typescript
// Obtener promociones de un salón
await getPromotionsBySalonId(salonId: string): Promise<Promotion[]>

// Guardar promociones (reemplaza todas)
await savePromotions(salonId: string, promotions: Promotion[]): Promise<boolean>
```

### Appointments

```typescript
// Guardar nueva reserva
await saveAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment | null>

// Obtener todas las reservas
await getAppointments(): Promise<Appointment[]>

// Obtener reservas de un salón
await getAppointmentsBySalonId(salonId: string): Promise<Appointment[]>

// Actualizar estado de reserva
await updateAppointmentStatus(id: string, status: string): Promise<boolean>
```

---

## 🔐 Seguridad Implementada

### 1. **Passwords Hasheados**

```typescript
// Al registrar
const passwordHash = await bcrypt.hash(password, 10);

// Al hacer login
const isValid = await bcrypt.compare(password, passwordHash);
```

### 2. **Row Level Security (RLS)**

Políticas implementadas:
- ✅ Lectura pública de salones y servicios
- ✅ Solo el dueño puede modificar su salón
- ✅ Clientes pueden crear reservas
- ✅ Solo el salón puede actualizar/eliminar reservas

### 3. **Variables de Entorno**

```env
# .env.local (NO subir a GitHub)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

## 🔄 Cómo Actualizar Componentes

### Ejemplo: Componente de Registro

#### Antes:

```typescript
'use client';
import { saveSalon } from '@/lib/storage';

const handleSubmit = (e) => {
  e.preventDefault();
  saveSalon(newSalon); // Síncrono
  router.push('/dashboard');
};
```

#### Después:

```typescript
'use client';
import { saveSalon } from '@/lib/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  const salon = await saveSalon(newSalon); // Asíncrono
  if (salon) {
    router.push(`/salon/dashboard/${salon.id}`);
  }
};
```

### Cambios Necesarios:

1. ✅ Cambiar import de `@/lib/storage` a `@/lib/api`
2. ✅ Hacer la función `async`
3. ✅ Usar `await` en las llamadas
4. ✅ Manejar el resultado (puede ser null)
5. ✅ Agregar loading states
6. ✅ Manejar errores

---

## 📊 Comparación: localStorage vs Supabase

| Característica | localStorage | Supabase |
|----------------|--------------|----------|
| **Persistencia** | Solo en navegador | Base de datos real |
| **Compartir datos** | ❌ No | ✅ Sí |
| **Múltiples dispositivos** | ❌ No | ✅ Sí |
| **Backup** | ❌ No | ✅ Automático |
| **Escalabilidad** | ❌ Limitado | ✅ Ilimitado |
| **Búsquedas complejas** | ❌ Difícil | ✅ SQL completo |
| **Seguridad** | ⚠️ Básica | ✅ RLS + Auth |
| **Velocidad** | ✅ Muy rápido | ✅ Rápido |
| **Costo** | ✅ Gratis | ✅ Gratis (hasta 500MB) |

---

## 🎯 Ventajas de la Migración

### Para el Desarrollo:

1. ✅ **Datos persistentes**: No se pierden al limpiar caché
2. ✅ **Compartir datos**: Múltiples dispositivos/navegadores
3. ✅ **Testing**: Datos reales en staging
4. ✅ **Debugging**: Ver datos en Supabase dashboard
5. ✅ **Backups**: Automáticos cada día

### Para Producción:

1. ✅ **Escalable**: Soporta miles de salones
2. ✅ **Confiable**: 99.9% uptime
3. ✅ **Rápido**: Queries optimizadas con índices
4. ✅ **Seguro**: Encriptación + RLS
5. ✅ **Profesional**: Base de datos real

### Para los Usuarios:

1. ✅ **Acceso desde cualquier lugar**: Web responsive
2. ✅ **Datos seguros**: No se pierden
3. ✅ **Sincronización**: Cambios en tiempo real
4. ✅ **Backup**: Recuperación de datos

---

## 🚀 Plan de Migración

### Fase 1: Configuración (✅ Completado)

- [x] Instalar Supabase
- [x] Crear schema SQL
- [x] Implementar funciones de API
- [x] Documentar proceso

### Fase 2: Actualizar Componentes (Pendiente)

- [ ] Actualizar página de registro
- [ ] Actualizar página de login
- [ ] Actualizar dashboard
- [ ] Actualizar página de reservas
- [ ] Actualizar configuración

### Fase 3: Testing (Pendiente)

- [ ] Probar registro de salón
- [ ] Probar login
- [ ] Probar creación de servicios
- [ ] Probar reservas
- [ ] Probar promociones

### Fase 4: Deployment (Pendiente)

- [ ] Configurar variables en Vercel
- [ ] Deploy a staging
- [ ] Testing en staging
- [ ] Deploy a producción

---

## 📝 Checklist de Actualización por Archivo

### Archivos que DEBEN actualizarse:

- [ ] `app/salon/register/page.tsx`
- [ ] `app/salon/login/page.tsx`
- [ ] `app/salon/dashboard/[id]/page.tsx`
- [ ] `app/client/page.tsx`
- [ ] `app/client/book/[id]/page.tsx`
- [ ] `components/ServicesManager.tsx`
- [ ] `components/StylistsManager.tsx`
- [ ] `components/PaymentMethodsManager.tsx`
- [ ] `components/PromotionsManager.tsx`

### Archivos que NO necesitan cambios:

- ✅ `lib/types.ts` - Los tipos siguen igual
- ✅ `lib/utils.ts` - Utilidades sin cambios
- ✅ Componentes de UI - Sin cambios
- ✅ Estilos - Sin cambios

---

## 🔧 Configuración Requerida

### 1. Crear Proyecto en Supabase

Ver guía completa en `SUPABASE_SETUP.md`

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.local.example .env.local

# Editar con tus credenciales
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Ejecutar Schema

1. Ir a Supabase SQL Editor
2. Copiar contenido de `supabase/schema.sql`
3. Ejecutar

### 4. Reiniciar Servidor

```bash
npm run dev
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"

**Solución**:
```bash
npm install @supabase/supabase-js
```

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solución**:
1. Crear archivo `.env.local`
2. Agregar las variables
3. Reiniciar servidor

### Error: "Failed to fetch"

**Solución**:
1. Verificar conexión a internet
2. Verificar que el proyecto de Supabase esté activo
3. Revisar la URL en .env.local

---

## 📈 Próximos Pasos

1. **Configurar Supabase** siguiendo `SUPABASE_SETUP.md`
2. **Actualizar componentes** uno por uno
3. **Probar cada funcionalidad** después de actualizar
4. **Deploy a staging** para testing completo
5. **Deploy a producción** cuando todo funcione

---

## 📞 Soporte

Si tienes problemas con la migración:

1. Revisa `SUPABASE_SETUP.md`
2. Verifica la consola del navegador
3. Revisa los logs de Supabase
4. Contacta: info@salonflow.com

---

**Fecha de implementación**: Octubre 2025  
**Versión**: 3.0.0  
**Estado**: ⚙️ Infraestructura lista - Pendiente actualizar componentes

¡La base de datos está lista para usar! 🎉
