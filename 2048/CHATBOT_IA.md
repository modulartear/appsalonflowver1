# Chatbot con IA - SalonFlow

## 🤖 Descripción

Chatbot inteligente integrado en la landing page que responde preguntas sobre SalonFlow usando GPT-3.5 de OpenAI.

## ✨ Características

### **Interfaz de Usuario**

1. **Botón Flotante**
   - Ubicación: Esquina inferior derecha
   - Icono de mensaje con badge animado
   - Tooltip al hacer hover: "¿Necesitas ayuda? 💬"
   - Animación de escala al hover

2. **Ventana de Chat**
   - Tamaño: 384px × 600px
   - Header con gradiente y estado "En línea"
   - Área de mensajes con scroll
   - Input con botón de envío
   - Preguntas rápidas iniciales

3. **Mensajes**
   - Burbujas diferenciadas (usuario vs bot)
   - Avatares con iconos
   - Timestamps
   - Animación de "escribiendo..." con 3 puntos

### **Funcionalidad IA**

1. **Modelo**: GPT-3.5-turbo de OpenAI
2. **Contexto**: Conocimiento completo sobre SalonFlow
3. **Tono**: Amigable, profesional, argentino
4. **Límites**: Respuestas concisas (máx 300 tokens)

### **Preguntas Rápidas**

Al abrir el chat, se muestran 4 botones:
- "¿Qué es SalonFlow?"
- "¿Cuánto cuesta?"
- "¿Cómo funciona?"
- "¿Tiene período de prueba?"

## 🔧 Implementación

### **Archivos Creados**

1. **`components/Chatbot.tsx`**
   - Componente React del chatbot
   - Manejo de estado de mensajes
   - UI completa con animaciones

2. **`app/api/chat/route.ts`**
   - API route para comunicación con OpenAI
   - System prompt con información de SalonFlow
   - Manejo de errores

3. **`app/page.tsx`** (modificado)
   - Importación del componente Chatbot
   - Integración en landing page

4. **`package.json`** (modificado)
   - Agregada dependencia `openai: ^4.77.0`

5. **`.env.example`**
   - Template para variables de entorno

## 🔑 Configuración

### **1. Obtener API Key de OpenAI**

1. Crear cuenta en [platform.openai.com](https://platform.openai.com)
2. Ir a API Keys
3. Crear nueva API key
4. Copiar la key (solo se muestra una vez)

### **2. Configurar Variables de Entorno**

Crear archivo `.env.local` en la raíz del proyecto:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### **3. Instalar Dependencias**

```bash
npm install
```

### **4. Ejecutar en Desarrollo**

```bash
npm run dev
```

### **5. Desplegar a Producción**

En Vercel, agregar la variable de entorno:

1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar: `OPENAI_API_KEY` = `tu_api_key`
4. Redesplegar:
   ```bash
   vercel --prod
   ```

## 💡 System Prompt

El chatbot tiene el siguiente contexto:

```
Eres un asistente virtual amigable y profesional de SalonFlow, 
una plataforma de gestión para salones de belleza en Argentina.

INFORMACIÓN SOBRE SALONFLOW:
- Plataforma web para gestionar salones de belleza
- Reservas online 24/7
- Gestión de horarios, servicios, estilistas y promociones
- Período de prueba GRATIS de 15 días
- Plan PRO: $9,999/mes

CARACTERÍSTICAS:
* Sistema de reservas online
* Gestión de horarios por día (mañana y tarde)
* Múltiples servicios y estilistas
* Promociones y descuentos
* Métodos de pago flexibles
* Panel de administración completo
* Notificaciones automáticas

TONO: Amigable, profesional, servicial y entusiasta.
Usar lenguaje argentino cuando sea apropiado.
```

## 📊 Flujo de Conversación

### **Ejemplo 1: Pregunta sobre Precio**

**Usuario**: "¿Cuánto cuesta?"

**Bot**: "¡Hola! 👋 SalonFlow tiene un período de prueba GRATIS de 15 días para que pruebes todas las funcionalidades. Después, el Plan PRO cuesta $9,999/mes con acceso completo a reservas online, gestión de horarios, promociones y más. ¿Te gustaría saber más sobre alguna característica?"

### **Ejemplo 2: Pregunta sobre Funcionalidades**

**Usuario**: "¿Cómo funciona?"

**Bot**: "¡Es súper fácil! 😊 Como dueño, registrás tu salón, configurás tus horarios y servicios. Tus clientes pueden reservar turnos online 24/7 desde cualquier dispositivo. Vos gestionás todo desde un panel simple: horarios, estilistas, promociones y más. ¿Querés que te cuente sobre alguna función específica?"

### **Ejemplo 3: Pregunta Técnica**

**Usuario**: "¿Puedo configurar diferentes horarios por día?"

**Bot**: "¡Sí, totalmente! 🎯 Podés configurar horarios diferentes para cada día de la semana, incluso separar turno mañana y tarde. Por ejemplo: Lunes 9-13hs y 15-21hs, Martes solo mañana, etc. Tenés control total sobre cuándo tu salón atiende. ¿Te gustaría ver cómo funciona?"

## 🎨 Diseño Visual

### **Colores**

- **Header**: Gradiente primary-600 → accent-600
- **Mensajes Usuario**: primary-600 (azul)
- **Mensajes Bot**: Blanco con borde gris
- **Botón Flotante**: Gradiente con shadow-2xl

### **Animaciones**

- Botón flotante: `hover:scale-110`
- Badge: `animate-pulse`
- Escribiendo: 3 puntos con `animate-bounce` escalonado
- Mensajes: Scroll suave al nuevo mensaje

### **Responsive**

- Desktop: 384px × 600px
- Mobile: Ajusta al ancho de pantalla (con padding)

## 🔒 Seguridad

### **API Key Protection**

- ✅ API key solo en servidor (no expuesta al cliente)
- ✅ Validación de mensajes en API route
- ✅ Rate limiting recomendado (no implementado aún)

### **Manejo de Errores**

- Si falla OpenAI: Mensaje de fallback amigable
- Si falta API key: Mensaje indicando servicio no disponible
- Timeout: 30 segundos por defecto

## 💰 Costos de OpenAI

### **Modelo**: GPT-3.5-turbo

- **Input**: $0.50 / 1M tokens
- **Output**: $1.50 / 1M tokens

### **Estimación**

Promedio por conversación:
- 5 mensajes × 100 tokens = 500 tokens
- Costo: ~$0.001 por conversación
- 1000 conversaciones: ~$1 USD

**Muy económico para el valor que aporta** ✅

## 📈 Métricas Sugeridas

Para implementar en el futuro:

1. **Cantidad de conversaciones** por día/mes
2. **Preguntas más frecuentes**
3. **Tasa de conversión** (chat → registro)
4. **Satisfacción del usuario** (thumbs up/down)
5. **Tiempo promedio de respuesta**

## 🚀 Mejoras Futuras

1. **Historial Persistente**
   - Guardar conversaciones en Supabase
   - Recuperar historial al volver

2. **Integraciones**
   - Crear cuenta directamente desde chat
   - Agendar demo con calendario

3. **Personalización**
   - Detectar si es dueño de salón o cliente
   - Respuestas contextuales según página

4. **Analytics**
   - Dashboard de métricas del chatbot
   - Análisis de sentimiento

5. **Multilenguaje**
   - Detectar idioma automáticamente
   - Soporte para inglés, portugués

## 🧪 Testing

### **Preguntas de Prueba**

1. "¿Qué es SalonFlow?"
2. "¿Cuánto cuesta?"
3. "¿Tienen período de prueba?"
4. "¿Cómo reservo un turno?"
5. "¿Puedo gestionar varios estilistas?"
6. "¿Aceptan MercadoPago?"
7. "¿Funciona en celular?"
8. "¿Cómo me registro?"

### **Casos Edge**

- Mensaje vacío → No envía
- Mensaje muy largo → OpenAI trunca
- Sin internet → Error amigable
- API key inválida → Fallback

## 📱 Uso

### **Para Usuarios**

1. Hacer click en botón flotante (esquina inferior derecha)
2. Escribir pregunta o usar pregunta rápida
3. Recibir respuesta instantánea
4. Continuar conversación naturalmente

### **Para Desarrolladores**

```typescript
// Componente se importa y usa así:
import Chatbot from '@/components/Chatbot';

<Chatbot />
```

## 🎯 Objetivos del Chatbot

1. ✅ **Responder preguntas** 24/7 sin intervención humana
2. ✅ **Aumentar conversiones** explicando beneficios
3. ✅ **Reducir fricción** en el proceso de registro
4. ✅ **Mejorar UX** con asistencia inmediata
5. ✅ **Capturar leads** interesados en la plataforma

---

**Desarrollado**: 2025-11-01  
**Versión**: 1.0.0  
**Modelo**: GPT-3.5-turbo  
**Costo estimado**: ~$1 USD por 1000 conversaciones
