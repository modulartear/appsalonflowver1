# Configuración de Firestore - Reglas de Seguridad

## 📋 Descripción

Este documento explica cómo desplegar las reglas de seguridad de Firestore para producción en tu aplicación SalonFlow.

## 🔒 Reglas de Seguridad Implementadas

Las reglas de seguridad en `firestore.rules` protegen tu base de datos con las siguientes políticas:

### **Colección: salons**
- ✅ **Lectura pública**: Cualquiera puede leer información de salones (necesario para la página de reservas)
- ✅ **Creación**: Solo usuarios autenticados pueden crear salones
- ✅ **Actualización/Eliminación**: Solo el dueño del salón puede modificar o eliminar su salón
- ✅ **Subcolecciones** (services, promotions, stylists, paymentMethods): 
  - Lectura pública
  - Escritura solo por el dueño del salón

### **Colección: appointments**
- ✅ **Lectura pública**: Cualquiera puede leer citas (filtradas por salonId en la aplicación)
- ✅ **Creación**: Cualquiera puede crear citas (clientes reservando)
- ✅ **Validación**: Se validan campos requeridos y que el salón exista
- ✅ **Actualización**: Solo el dueño del salón puede actualizar citas (confirmar, cancelar, completar)
- ✅ **Verificación de plan**: Solo salones con plan válido pueden actualizar citas
- ✅ **Eliminación**: Solo el dueño del salón puede eliminar citas

### **Colección: users**
- ✅ **Lectura/Escritura**: Solo el usuario puede acceder a sus propios datos

### **Colección: payments**
- ✅ **Lectura**: Solo el usuario puede ver sus propios pagos
- ✅ **Creación**: Solo usuarios autenticados
- ✅ **Actualización/Eliminación**: Bloqueado (solo Cloud Functions)

### **Colección: notifications**
- ✅ **Lectura/Escritura**: Solo el usuario puede acceder a sus propias notificaciones

### **Colección: statistics**
- ✅ **Lectura**: Solo el dueño del salón
- ✅ **Escritura**: Bloqueado (solo Cloud Functions)

## 🚀 Cómo Desplegar las Reglas

### **Opción 1: Firebase Console (Interfaz Web)**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**
4. Haz clic en la pestaña **Reglas** (Rules)
5. Copia el contenido del archivo `firestore.rules`
6. Pégalo en el editor de reglas
7. Haz clic en **Publicar** (Publish)

### **Opción 2: Firebase CLI (Línea de Comandos)**

#### **Paso 1: Instalar Firebase CLI**

```bash
npm install -g firebase-tools
```

#### **Paso 2: Iniciar sesión en Firebase**

```bash
firebase login
```

#### **Paso 3: Inicializar Firebase en tu proyecto**

```bash
firebase init firestore
```

Selecciona:
- Tu proyecto de Firebase
- Usa el archivo `firestore.rules` existente
- No sobrescribir el archivo

#### **Paso 4: Desplegar las reglas**

```bash
firebase deploy --only firestore:rules
```

## ⚙️ Configuración Adicional

### **Crear archivo firebase.json (si no existe)**

Si no tienes un archivo `firebase.json`, créalo en la raíz del proyecto:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### **Crear archivo firestore.indexes.json (opcional)**

Para optimizar consultas, crea `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "salonId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "salonId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 🧪 Probar las Reglas

### **En Firebase Console**

1. Ve a **Firestore Database** > **Reglas**
2. Haz clic en **Simulador de reglas** (Rules Playground)
3. Prueba diferentes operaciones:
   - Lectura de salones (sin autenticación) ✅
   - Creación de citas (sin autenticación) ✅
   - Actualización de citas (sin autenticación) ❌
   - Actualización de citas (como dueño del salón) ✅

### **Ejemplos de Pruebas**

#### **Lectura de salón (debe permitir)**
```
Operación: get
Ruta: /salons/salon123
Autenticado: No
Resultado esperado: ✅ Permitido
```

#### **Crear cita (debe permitir)**
```
Operación: create
Ruta: /appointments/appointment123
Autenticado: No
Datos: {
  salonId: "salon123",
  clientName: "Juan Pérez",
  clientEmail: "juan@example.com",
  clientPhone: "+54911234567",
  service: "Corte de cabello",
  date: "2025-11-15",
  time: "10:00",
  status: "pending"
}
Resultado esperado: ✅ Permitido
```

#### **Actualizar cita (sin autenticación, debe denegar)**
```
Operación: update
Ruta: /appointments/appointment123
Autenticado: No
Resultado esperado: ❌ Denegado
```

## 📊 Estructura de Datos Esperada

### **Salón**
```typescript
{
  id: string,
  ownerId: string, // Firebase Auth UID
  name: string,
  ownerName: string,
  email: string,
  phone: string,
  address: string,
  city?: string,
  description: string,
  plan: 'free' | 'pro',
  planStartDate: Timestamp,
  workingHours?: {
    start: string,
    end: string
  }
}
```

### **Cita**
```typescript
{
  id: string,
  salonId: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  service: string,
  date: string,
  time: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  notes?: string,
  paymentMethod?: string,
  promotion?: string,
  discount?: number,
  originalPrice?: number,
  finalPrice?: number,
  createdAt: Timestamp
}
```

## 🔐 Seguridad Adicional

### **Variables de Entorno**

Asegúrate de tener configuradas las siguientes variables en `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### **Mejores Prácticas**

1. ✅ **Nunca expongas claves privadas** en el código del cliente
2. ✅ **Usa Firebase Authentication** para autenticar usuarios
3. ✅ **Valida datos en el servidor** con Cloud Functions
4. ✅ **Monitorea el uso** en Firebase Console
5. ✅ **Configura límites de cuota** para prevenir abuso
6. ✅ **Habilita App Check** para proteger contra tráfico no autorizado

## 📈 Monitoreo

### **Ver Actividad de Reglas**

1. Ve a **Firestore Database** > **Uso**
2. Revisa:
   - Lecturas/Escrituras por día
   - Errores de reglas
   - Operaciones denegadas

### **Alertas**

Configura alertas en Firebase Console para:
- Operaciones denegadas inusuales
- Picos de tráfico
- Errores de reglas

## 🆘 Solución de Problemas

### **Error: "Missing or insufficient permissions"**

**Causa**: Las reglas están bloqueando la operación

**Solución**:
1. Verifica que el usuario esté autenticado (si es necesario)
2. Revisa que los datos cumplan con las validaciones
3. Usa el simulador de reglas para debuggear

### **Error: "PERMISSION_DENIED"**

**Causa**: El usuario no tiene permisos para la operación

**Solución**:
1. Verifica que el `ownerId` coincida con el `auth.uid`
2. Revisa que el plan del salón sea válido
3. Confirma que el documento existe

### **Las reglas no se aplican**

**Causa**: Las reglas no se han desplegado correctamente

**Solución**:
```bash
firebase deploy --only firestore:rules --force
```

## 📚 Recursos Adicionales

- [Documentación oficial de Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guía de mejores prácticas](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Referencia de reglas](https://firebase.google.com/docs/reference/security/firestore)

---

## ⚠️ Nota Importante

**Tu aplicación actualmente usa Supabase (PostgreSQL), no Firestore.** Si deseas migrar a Firestore, necesitarás:

1. Crear un proyecto en Firebase
2. Configurar Firebase en tu aplicación Next.js
3. Migrar los datos de Supabase a Firestore
4. Actualizar el código para usar el SDK de Firebase

Si necesitas ayuda con la migración, consulta el archivo `MIGRACION_FIRESTORE.md` (próximamente).
