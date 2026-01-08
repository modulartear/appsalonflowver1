# 🗄️ Configuración de Supabase para SalonFlow

## 📋 Resumen

Esta guía te ayudará a configurar Supabase (base de datos PostgreSQL) para reemplazar el almacenamiento local de SalonFlow.

---

## 🚀 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con:
   - GitHub (recomendado)
   - Google
   - Email

---

## 🏗️ Paso 2: Crear Nuevo Proyecto

1. En el dashboard de Supabase, clic en "New Project"
2. Completa los datos:
   - **Name**: `salonflow-db` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana (ej: South America - São Paulo)
   - **Pricing Plan**: Free (suficiente para empezar)

3. Clic en "Create new project"
4. Espera 2-3 minutos mientras se crea el proyecto

---

## 🗃️ Paso 3: Ejecutar el Schema SQL

1. En el dashboard de tu proyecto, ve a **SQL Editor** (icono de base de datos en el menú lateral)

2. Clic en "New query"

3. Copia y pega todo el contenido del archivo `supabase/schema.sql`

4. Clic en "Run" (o presiona Ctrl+Enter)

5. Verifica que aparezca: ✅ "Success. No rows returned"

---

## 🔑 Paso 4: Obtener las Credenciales

1. Ve a **Settings** → **API** (icono de engranaje en el menú lateral)

2. En la sección "Project API keys", encontrarás:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **¡IMPORTANTE!** Copia estos dos valores

---

## ⚙️ Paso 5: Configurar Variables de Entorno

1. En la raíz del proyecto, crea el archivo `.env.local`:

```bash
# En Windows
copy .env.local.example .env.local

# En Mac/Linux
cp .env.local.example .env.local
```

2. Abre `.env.local` y completa con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Guarda el archivo

---

## 🔒 Paso 6: Seguridad - Gitignore

Verifica que `.env.local` esté en `.gitignore`:

```gitignore
# .gitignore
.env.local
.env*.local
```

**¡NUNCA subas .env.local a GitHub!**

---

## ✅ Paso 7: Verificar la Instalación

1. Reinicia el servidor de desarrollo:

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

2. Abre la consola del navegador (F12)

3. Si ves errores de Supabase, verifica:
   - Las variables de entorno están correctas
   - El servidor se reinició después de crear .env.local
   - No hay espacios extra en las credenciales

---

## 🧪 Paso 8: Probar la Conexión

### Opción 1: Registrar un Salón

1. Ve a http://localhost:3000/salon/register
2. Completa el formulario
3. Clic en "Registrar Salón"
4. Si funciona, serás redirigido al dashboard

### Opción 2: Verificar en Supabase

1. Ve a Supabase → **Table Editor**
2. Selecciona la tabla `salons`
3. Deberías ver el salón que registraste

---

## 📊 Estructura de la Base de Datos

### Tablas Creadas:

1. **salons** - Información de los salones
2. **services** - Servicios ofrecidos por cada salón
3. **stylists** - Estilistas de cada salón
4. **payment_methods** - Métodos de pago configurados
5. **promotions** - Promociones activas
6. **appointments** - Reservas de clientes

### Relaciones:

```
salons (1) ──→ (N) services
salons (1) ──→ (N) stylists
salons (1) ──→ (N) payment_methods
salons (1) ──→ (N) promotions
salons (1) ──→ (N) appointments
```

---

## 🔐 Seguridad Implementada

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que permiten:

- ✅ **Lectura pública**: Cualquiera puede ver salones y servicios
- ✅ **Escritura protegida**: Solo el dueño puede modificar su salón
- ✅ **Reservas**: Los clientes pueden crear reservas

### Passwords

- ✅ Hasheados con bcrypt (10 rounds)
- ✅ Nunca se devuelven en las consultas
- ✅ Validación segura en login

---

## 🔄 Migración desde LocalStorage

### Datos Existentes

Si tienes datos en localStorage que quieres migrar:

1. Abre la consola del navegador (F12)
2. Ejecuta:

```javascript
// Ver datos actuales
console.log(localStorage.getItem('salons'));
console.log(localStorage.getItem('appointments'));

// Copiar para backup
const salons = localStorage.getItem('salons');
const appointments = localStorage.getItem('appointments');
```

3. Guarda estos datos en un archivo de texto

4. **Nota**: La migración automática no está implementada. Los datos en localStorage permanecerán pero no se usarán.

---

## 🌐 Deployment en Vercel

### Configurar Variables de Entorno

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy el proyecto

---

## 📈 Monitoreo y Límites (Plan Free)

### Límites del Plan Gratuito:

- ✅ **Base de datos**: 500 MB
- ✅ **Bandwidth**: 5 GB/mes
- ✅ **Requests**: 50,000/mes
- ✅ **Storage**: 1 GB
- ✅ **Usuarios**: Ilimitados

### Monitorear Uso:

1. Supabase Dashboard → **Settings** → **Usage**
2. Verifica:
   - Database size
   - API requests
   - Bandwidth

---

## 🛠️ Troubleshooting

### Error: "Invalid API key"

**Solución**:
- Verifica que copiaste la clave completa
- No debe haber espacios al inicio/final
- Reinicia el servidor después de cambiar .env.local

### Error: "Failed to fetch"

**Solución**:
- Verifica tu conexión a internet
- Comprueba que el proyecto de Supabase esté activo
- Revisa la URL del proyecto

### Error: "Row Level Security"

**Solución**:
- Verifica que ejecutaste el schema.sql completo
- Las políticas de RLS deben estar creadas

### Datos no aparecen

**Solución**:
1. Ve a Supabase → Table Editor
2. Verifica que las tablas tengan datos
3. Revisa la consola del navegador por errores
4. Verifica que las funciones de API se estén llamando correctamente

---

## 🔄 Actualizar el Schema

Si necesitas modificar la estructura de la base de datos:

1. Ve a Supabase → SQL Editor
2. Ejecuta tus queries de ALTER TABLE
3. O crea una nueva migración

Ejemplo:
```sql
-- Agregar nueva columna
ALTER TABLE salons ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_salons_name ON salons(name);
```

---

## 📊 Backup de la Base de Datos

### Backup Manual:

1. Supabase → Database → Backups
2. Clic en "Create backup"
3. Espera a que se complete

### Backup Automático:

- Plan Free: 7 días de retención
- Plan Pro: 30 días de retención

---

## 🚀 Próximos Pasos

Una vez configurado Supabase:

1. ✅ Registra un salón de prueba
2. ✅ Agrega servicios
3. ✅ Crea una reserva
4. ✅ Verifica que todo funcione
5. ✅ Deploy a producción

---

## 📞 Soporte

### Documentación Oficial:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### Comunidad:
- [Discord de Supabase](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Supabase creada
- [ ] Proyecto creado
- [ ] Schema SQL ejecutado
- [ ] Credenciales copiadas
- [ ] .env.local creado y configurado
- [ ] Servidor reiniciado
- [ ] Registro de prueba exitoso
- [ ] Datos visibles en Supabase
- [ ] Variables configuradas en Vercel (para producción)

---

**Fecha de creación**: Octubre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar

¡Tu base de datos Supabase está lista! 🎉
