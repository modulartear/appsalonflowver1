# 🚀 Guía Rápida - SalonFlow

## Inicio Rápido

### 1️⃣ Iniciar la Aplicación

```bash
cd c:\Users\Admin\CascadeProjects\2048
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## 📋 Flujo Completo de Prueba

### PASO 1: Registrar un Nuevo Salón

1. **Ir a la Landing Page**
   - URL: `http://localhost:3000`
   - Verás el botón **"Mi Salón"** y **"Registrar Salón"**

2. **Hacer clic en "Registrar Salón"**
   - Te redirige a: `/salon/register`

3. **Completar el Formulario**
   ```
   📝 Información del Salón:
   - Nombre del Salón: "Bella Estética"
   - Nombre del Propietario: "María García"
   - Email: "maria@bellaestetica.com"
   - Contraseña: "123456" (mínimo 6 caracteres)
   - Confirmar Contraseña: "123456"
   - Teléfono: "1123456789"
   - Dirección: "Av. Corrientes 1234"
   - Ciudad: "Buenos Aires"
   - Descripción: "Salón de belleza especializado en..."
   
   ⏰ Horarios de Atención:
   - Apertura: 09:00
   - Cierre: 18:00
   
   ✂️ Servicios:
   - Corte de cabello (pre-cargado)
   - Coloración (pre-cargado)
   - Agregar más: "Manicura", "Pedicura", etc.
   ```

4. **Hacer clic en "Registrar Salón"**
   - ✅ Cuenta creada exitosamente
   - ✅ Automáticamente obtienes **15 días gratis**
   - ✅ Redirige a tu dashboard

---

### PASO 2: Ver el Dashboard

1. **Dashboard Automático**
   - URL: `/salon/dashboard/[tu-id-unico]`
   - Verás el banner: **"🎉 Plan Gratis - 15 días restantes"**

2. **Explorar el Dashboard**
   - 📊 Estadísticas de reservas
   - 📋 Información del salón
   - 🔗 Botón "Copiar Link de Reservas"
   - 👁️ Botón "Ver Página de Reservas"

3. **Copiar tu Link de Reservas**
   - Hacer clic en **"Copiar Link de Reservas"**
   - Ejemplo: `http://localhost:3000/client/book/abc-123-def`
   - Este link es para compartir con tus clientes

---

### PASO 3: Cerrar Sesión y Volver a Entrar

1. **Volver a la Landing Page**
   - Navegar a: `http://localhost:3000`

2. **Hacer clic en "Mi Salón"**
   - Te redirige a: `/salon/login`

3. **Iniciar Sesión**
   ```
   📧 Email: maria@bellaestetica.com
   🔒 Contraseña: 123456
   ```

4. **Hacer clic en "Ingresar a mi Salón"**
   - ✅ Login exitoso
   - ✅ Redirige a tu dashboard

---

### PASO 4: Simular Reserva de Cliente

1. **Usar el Link de Reservas**
   - Pegar el link copiado en una nueva pestaña
   - O hacer clic en "Ver Página de Reservas" desde el dashboard

2. **Completar Formulario de Reserva**
   ```
   👤 Información Personal:
   - Nombre: "Juan Pérez"
   - Email: "juan@email.com"
   - Teléfono: "1198765432"
   
   ✂️ Detalles del Turno:
   - Servicio: "Corte de cabello"
   - Fecha: Seleccionar fecha futura
   - Horario: Seleccionar horario disponible (ej: 10:00)
   - Notas: "Prefiero corte corto" (opcional)
   ```

3. **Confirmar Reserva**
   - ✅ Verás mensaje de éxito
   - ✅ Detalles de la reserva confirmada

---

### PASO 5: Gestionar Reservas en Dashboard

1. **Volver al Dashboard del Salón**
   - Login con: `maria@bellaestetica.com`

2. **Ver la Nueva Reserva**
   - Aparecerá en la lista de reservas
   - Estado: **"Pendiente"**

3. **Acciones Disponibles**
   - ✅ **Confirmar**: Cambia estado a "Confirmada"
   - ❌ **Cancelar**: Cambia estado a "Cancelada"
   - ✔️ **Completar**: Cambia estado a "Completada" (solo si está confirmada)

4. **Filtrar Reservas**
   - Todas
   - Pendientes
   - Confirmadas
   - Completadas

---

## 🎯 Casos de Prueba Rápidos

### ✅ Registro Exitoso
```
Email: nuevo@salon.com
Contraseña: 123456
Resultado: ✅ Dashboard con 15 días gratis
```

### ❌ Email Duplicado
```
Email: maria@bellaestetica.com (ya existe)
Resultado: ❌ "Este email ya está registrado"
```

### ❌ Contraseña Corta
```
Contraseña: 12345
Resultado: ❌ "La contraseña debe tener al menos 6 caracteres"
```

### ❌ Contraseñas No Coinciden
```
Contraseña: 123456
Confirmar: 654321
Resultado: ❌ "Las contraseñas no coinciden"
```

### ✅ Login Exitoso
```
Email: maria@bellaestetica.com
Contraseña: 123456
Resultado: ✅ Acceso al dashboard
```

### ❌ Login Fallido
```
Email: maria@bellaestetica.com
Contraseña: incorrecta
Resultado: ❌ "Email o contraseña incorrectos"
```

---

## 🔗 URLs Importantes

### Páginas Principales
- **Landing**: `http://localhost:3000`
- **Registro**: `http://localhost:3000/salon/register`
- **Login**: `http://localhost:3000/salon/login`
- **Dashboard**: `http://localhost:3000/salon/dashboard/[id]`
- **Reservas**: `http://localhost:3000/client/book/[id]`

### Navegación Rápida
```
Landing Page
├── Mi Salón → Login
├── Registrar Salón → Formulario de Registro
│   └── Éxito → Dashboard
└── Ver Planes → Sección de Precios

Dashboard
├── Copiar Link → Link de reservas
├── Ver Página → Página de reservas
└── Gestionar Reservas → Confirmar/Cancelar/Completar
```

---

## 📱 Probar Responsive

### Desktop (1920x1080)
- Navegación completa visible
- Grid de 3 columnas en características
- Formularios en 2 columnas

### Tablet (768x1024)
- Navegación con menú
- Grid de 2 columnas
- Formularios adaptados

### Mobile (375x667)
- Navegación hamburguesa (si implementada)
- Grid de 1 columna
- Formularios verticales
- Botones full-width

---

## 🎨 Elementos Visuales a Verificar

### Landing Page
- ✅ Gradientes en títulos
- ✅ Animaciones fade-in y slide-up
- ✅ Hover effects en tarjetas
- ✅ Sección de planes con badges
- ✅ Botón "RECOMENDADO" en Plan Pro

### Formularios
- ✅ Validación en tiempo real
- ✅ Mensajes de error en rojo
- ✅ Campos con focus ring
- ✅ Placeholders informativos

### Dashboard
- ✅ Banner de trial con días restantes
- ✅ Cambio de color según días (verde → rojo)
- ✅ Estadísticas con iconos
- ✅ Tarjetas de reservas con estados

---

## 🐛 Problemas Comunes

### "Este email ya está registrado"
**Solución**: Usar otro email o limpiar LocalStorage
```javascript
// En consola del navegador:
localStorage.clear();
```

### No puedo ver mis reservas
**Solución**: Verificar que estás en el dashboard correcto
- El ID del dashboard debe coincidir con tu salón

### El link de reservas no funciona
**Solución**: Copiar el link completo desde el dashboard
- Incluye el ID único del salón

### Olvidé mi contraseña
**Solución**: Por ahora, contactar soporte o limpiar LocalStorage
- Futuro: Sistema de recuperación automático

---

## 💡 Tips de Desarrollo

### Ver Datos en LocalStorage
```javascript
// Abrir consola del navegador (F12)

// Ver todos los salones
JSON.parse(localStorage.getItem('salons'))

// Ver todas las reservas
JSON.parse(localStorage.getItem('appointments'))

// Limpiar todo
localStorage.clear()
```

### Simular Expiración de Trial
```javascript
// Modificar fecha de expiración
const salons = JSON.parse(localStorage.getItem('salons'));
salons[0].trialEndsAt = new Date().toISOString(); // Ya expiró
localStorage.setItem('salons', JSON.stringify(salons));
// Recargar página
```

### Crear Múltiples Salones
```
1. Registrar: salon1@test.com
2. Registrar: salon2@test.com
3. Registrar: salon3@test.com
```

---

## ✅ Checklist de Prueba Completa

### Registro
- [ ] Registrar nuevo salón
- [ ] Ver error de email duplicado
- [ ] Ver error de contraseña corta
- [ ] Ver error de contraseñas no coinciden
- [ ] Verificar redirección a dashboard
- [ ] Verificar 15 días gratis

### Login
- [ ] Login exitoso
- [ ] Ver error de credenciales incorrectas
- [ ] Ver error de campos vacíos
- [ ] Verificar redirección a dashboard

### Dashboard
- [ ] Ver banner de trial
- [ ] Copiar link de reservas
- [ ] Ver página de reservas
- [ ] Ver información del salón
- [ ] Ver estadísticas

### Reservas
- [ ] Crear reserva como cliente
- [ ] Ver reserva en dashboard
- [ ] Confirmar reserva
- [ ] Cancelar reserva
- [ ] Completar reserva
- [ ] Filtrar por estado

### Responsive
- [ ] Probar en desktop
- [ ] Probar en tablet
- [ ] Probar en mobile

---

## 🎉 ¡Listo!

Tu aplicación SalonFlow está completamente funcional con:
- ✅ Sistema de autenticación
- ✅ Planes de precios (Gratis 15 días / Pro $49.000)
- ✅ Registro y login de salones
- ✅ Dashboard completo
- ✅ Sistema de reservas por link
- ✅ Gestión de turnos
- ✅ Diseño responsive y moderno

**¡Disfruta probando tu aplicación!** 🚀
