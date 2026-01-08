# ⚡ Inicio Rápido - 4 Pasos

## ✅ Ya está hecho:
- Código actualizado para usar base de datos
- Dependencias instaladas
- Todo listo para funcionar

---

## 🚀 Lo que DEBES hacer (25 minutos):

### 1️⃣ Crear Proyecto en Supabase
- Ve a https://supabase.com
- Crea cuenta → New Project
- Nombre: `salonflow-db`
- Region: South America
- Espera 2-3 minutos

### 2️⃣ Ejecutar SQL
- Supabase → SQL Editor → New query
- Copia TODO de `supabase/schema.sql`
- Pega y ejecuta (Run)

### 3️⃣ Configurar Credenciales
- Supabase → Settings → API
- Copia: Project URL y anon public key
- Crea archivo `.env.local` en la raíz:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

### 4️⃣ Reiniciar Servidor
```bash
# Ctrl+C para detener
npm run dev
```

---

## ✅ Probar

1. Registra un salón: http://localhost:3000/salon/register
2. Verifica en Supabase → Table Editor → salons
3. Haz login: http://localhost:3000/salon/login
4. Crea una reserva desde /client

---

## 📚 Más Info

- **Guía completa**: `PASOS_SIGUIENTES.md`
- **Configuración detallada**: `SUPABASE_SETUP.md`
- **Documentación técnica**: `MIGRACION_BASE_DATOS.md`

---

**¿Problemas?** Lee `PASOS_SIGUIENTES.md` → Sección "Si Algo No Funciona"

**¡Listo!** 🎉
