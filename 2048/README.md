# SalonFlow - Sistema de Reservas para Salones de Belleza

Una aplicación moderna y responsive de Next.js para gestionar reservas de turnos en salones de estética y peluquerías.

## 🌟 Características

- **Landing Page Atractiva**: Página de inicio moderna con información sobre la plataforma y planes de precios
- **Sistema de Autenticación**: Login seguro con email y contraseña para dueños de salones
- **Sistema de Planes**:
  - **Plan Gratis**: 15 días de prueba con todas las funcionalidades
  - **Plan Pro**: $5.000/mes con acceso ilimitado
  - **Control de Expiración**: Bloqueo automático al finalizar el período de prueba
  - **Integración con MercadoPago**: Pagos seguros para el Plan Pro
- **Registro de Salones**: Formulario completo con creación de cuenta
- **Panel de Control para Salones**: Dashboard completo donde los dueños pueden:
  - Ver todas sus reservas
  - Confirmar, cancelar o completar turnos
  - Ver estadísticas de reservas e ingresos (diarios y mensuales)
  - Compartir link de reservas con clientes
  - Monitorear días restantes del período de prueba
  - **Gestionar Servicios**: Agregar servicios con precio y duración
  - **Crear Promociones**: Descuentos por servicio o por día de la semana
  - **Configurar Estilistas**: Agregar estilistas con especialidades
  - **Métodos de Pago**: Configurar pagos locales y online
- **Sistema de Reservas por Link**: Los clientes reservan mediante el link único del salón
- **Notificaciones Automáticas**:
  - **Email**: Confirmaciones por correo electrónico (Nodemailer)
  - **WhatsApp**: Notificaciones por WhatsApp (Twilio)
- **Indicadores Visuales**: Horarios disponibles en verde, ocupados en rojo
- **Sistema de IDs Únicos**: Cada salón tiene un ID único generado automáticamente
- **Diseño Responsive**: Optimizado para desktop, tablet y móvil
- **Animaciones Suaves**: Transiciones y animaciones modernas
- **Colores Modernos**: Paleta de colores vibrante con gradientes

## 🎨 Tecnologías

- **Next.js 14**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos modernos y responsive
- **Lucide React**: Iconos modernos y elegantes
- **Supabase**: Base de datos PostgreSQL y autenticación
- **MercadoPago SDK**: Procesamiento de pagos
- **Twilio**: Notificaciones por WhatsApp
- **Nodemailer**: Envío de emails
- **bcryptjs**: Hash de contraseñas
- **UUID**: Generación de IDs únicos

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd salonflow-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

Edita `.env.local` y configura:
- **Supabase**: URL y clave anónima (obligatorio)
- **MercadoPago**: Token de acceso (obligatorio para pagos)
- **Email**: Configuración SMTP (opcional)
- **Twilio**: Credenciales para WhatsApp (opcional)

📚 **Guías de configuración**:
- WhatsApp: Ver `CONFIGURACION_TWILIO_WHATSAPP.md`
- MercadoPago: Ver `TOKEN_MERCADOPAGO.md`
- Supabase: Ver `SUPABASE_SETUP.md`

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

### 🧪 Probar Configuración de Twilio

Para verificar que Twilio WhatsApp está configurado correctamente:

```bash
node test-twilio.js
```

Este script te guiará para enviar un mensaje de prueba.

## 📱 Uso

### Para Dueños de Salones

1. **Registrar Salón**:
   - Haz clic en "Registrar Salón" en la página principal
   - Completa el formulario con la información de tu salón
   - **Crea tu contraseña** (mínimo 6 caracteres)
   - Agrega servicios personalizados
   - Define tus horarios de atención
   - Haz clic en "Registrar Salón"
   - **Automáticamente obtienes 15 días gratis** desde el momento del registro
   - Serás redirigido a tu dashboard

2. **Acceder a tu Dashboard**:
   - Haz clic en "Mi Salón" en la página principal
   - Ingresa tu email y contraseña
   - Accederás directamente a tu panel de control

3. **Compartir Link de Reservas**:
   - En tu dashboard, copia tu link único de reservas
   - Comparte el link con tus clientes por:
     - WhatsApp
     - Instagram/Facebook
     - Email
     - Tu sitio web
   - Los clientes pueden reservar directamente desde el link

4. **Gestionar Reservas**:
   - Accede a tu dashboard con tu email y contraseña
   - Monitorea los días restantes de tu período de prueba
   - Confirma, cancela o completa reservas según sea necesario
   - Filtra reservas por estado
   - Actualiza al Plan Pro cuando lo necesites

### Para Clientes

1. **Acceder al Salón**:
   - Recibe el link de reservas del salón (por WhatsApp, redes sociales, etc.)
   - Haz clic en el link para acceder a la página de reservas

2. **Reservar Turno**:
   - Completa tus datos personales
   - Elige el servicio deseado
   - Selecciona fecha y horario disponible
   - Agrega notas si es necesario
   - Confirma tu reserva
   - Recibirás confirmación por email

## 🎯 Estructura del Proyecto

```
salon-booking-app/
├── app/
│   ├── client/                 # Páginas de clientes
│   │   ├── page.tsx           # Lista de salones
│   │   └── book/[id]/         # Formulario de reserva
│   ├── salon/                  # Páginas de salones
│   │   ├── register/          # Registro de salón
│   │   └── dashboard/[id]/    # Dashboard del salón
│   ├── globals.css            # Estilos globales
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Landing page
├── lib/
│   ├── types.ts               # Tipos TypeScript
│   ├── storage.ts             # Funciones de almacenamiento
│   └── utils.ts               # Utilidades
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Funcionalidades Técnicas

### Gestión de Datos

- **LocalStorage**: Los datos se almacenan localmente en el navegador
- **IDs Únicos**: Cada salón y reserva tiene un UUID único
- **Validación**: Validación de formularios en tiempo real
- **Filtrado**: Sistema de filtros para reservas y salones

### Autenticación

- **Registro**: Creación de cuenta con email y contraseña
- **Login**: Acceso seguro al dashboard del salón
- **Hash de Contraseñas**: Las contraseñas se almacenan hasheadas (base64 para demo)
- **Validación de Email**: Previene registros duplicados
- **Recuperación**: Sistema de recuperación por email (contacto)

### Sistema de Planes

- **Plan Gratis**: 15 días de prueba desde el registro
- **Cálculo Automático**: El sistema calcula automáticamente la fecha de expiración
- **Alertas**: Notificaciones visuales cuando quedan pocos días
- **Actualización**: Opción para actualizar al Plan Pro en cualquier momento

### Diseño Responsive

- **Mobile First**: Diseñado primero para móviles
- **Breakpoints**: Adaptado para todas las pantallas
- **Touch Friendly**: Botones y elementos táctiles optimizados

### Animaciones

- **Fade In**: Aparición suave de elementos
- **Slide Up**: Deslizamiento desde abajo
- **Hover Effects**: Efectos al pasar el mouse
- **Transitions**: Transiciones suaves en todos los elementos

## 🎨 Paleta de Colores

- **Primary**: Tonos de magenta/púrpura (#d946ef)
- **Accent**: Tonos de turquesa/teal (#14b8a6)
- **Gradientes**: Combinaciones de primary y accent

## 📝 Notas Importantes

- Los datos se almacenan en LocalStorage del navegador
- Las contraseñas se hashean con base64 (para producción usar bcrypt)
- Para producción, se recomienda implementar un backend con base de datos
- Los horarios disponibles se actualizan en tiempo real
- Cada salón tiene su propia URL única para reservas
- El período de prueba de 15 días comienza automáticamente al registrarse
- Los clientes NO necesitan registrarse, solo acceden mediante el link del salón
- Los dueños de salones deben recordar su contraseña (sistema de recuperación por email)

## 💰 Sistema de Planes

### Plan Gratis (15 días)
- Comienza automáticamente al registrar tu salón
- Acceso completo a todas las funcionalidades
- Sin tarjeta de crédito requerida
- Ideal para probar la plataforma

### Plan Pro ($5.000/mes)
- Acceso ilimitado sin restricciones
- Todas las funcionalidades del Plan Gratis
- Notificaciones automáticas por WhatsApp
- Estadísticas avanzadas
- Soporte prioritario 24/7
- Sin límite de tiempo
- Actualización instantánea desde el login o dashboard

### 🔒 Control de Expiración (Nuevo)

Cuando el período de prueba de 15 días finaliza:

**En el Login:**
- Se muestra un mensaje destacado con icono de corona
- Explica claramente que el período ha finalizado
- Lista los beneficios del Plan Pro
- Muestra el precio mensual ($5.000)
- **Botón directo "Actualizar a Plan Pro"** que redirige a Mercado Pago
- Bloquea el acceso hasta que se actualice el plan

**En el Dashboard:**
- Modal flotante automático si el período expira mientras está dentro
- Overlay que bloquea la interacción con el dashboard
- Mismo botón de actualización rápida

**Después de Actualizar:**
- El salón se reactiva automáticamente
- Acceso inmediato al dashboard
- Período renovado por 30 días

📚 **Documentación completa:** Ver `INSTRUCCIONES_MIGRACION.md`

## 🚀 Próximas Mejoras

- Sistema de autenticación para dueños de salones
- Base de datos real (PostgreSQL, MongoDB)
- Notificaciones por email automáticas
- Sistema de calificaciones y reseñas
- Panel de estadísticas avanzadas con gráficos
- Integración con calendarios (Google Calendar, etc.)
- Sistema de pagos online para el Plan Pro
- Recordatorios automáticos por WhatsApp/SMS
- App móvil nativa

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

Para construir para producción:

```bash
npm run build
npm start
```

Para linting:

```bash
npm run lint
```

---

Desarrollado con ❤️ usando Next.js y Tailwind CSS
