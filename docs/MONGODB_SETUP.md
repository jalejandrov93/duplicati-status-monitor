# MongoDB Configuration Guide

## ⚙️ Configuración de MongoDB Atlas

### 1. Configurar la URI de MongoDB

En tu archivo `.env.local`, configura la URI de la siguiente manera:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM?retryWrites=true&w=majority
```

**Importante:**
- ✅ **Base de datos**: `LTSM` (especificado en la URI después de `.net/`)
- ✅ **Colección**: `duplicati` (configurado en el código)
- ✅ Reemplaza `usuario` y `contraseña` con tus credenciales
- ✅ Reemplaza `cluster` con el nombre de tu cluster

### 2. Estructura Completa de la URI

```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?[options]
```

Ejemplo real:
```
mongodb+srv://admin:MiPassword123@cluster0.abc123.mongodb.net/LTSM?retryWrites=true&w=majority
```

### 3. Verificar Configuración en MongoDB Atlas

1. **Acceso de Red (Network Access)**:
   - Ve a MongoDB Atlas > Network Access
   - Asegúrate de tener tu IP agregada
   - Para desarrollo: puedes usar `0.0.0.0/0` (permite todas las IPs)
   - Para producción: usa IPs específicas

2. **Usuario de Base de Datos**:
   - Ve a Database Access
   - Verifica que el usuario tenga permisos de lectura/escritura
   - Rol recomendado: `readWrite` en la base de datos `LTSM`

3. **Nombre de Base de Datos y Colección**:
   - Base de datos: `LTSM`
   - Colección: `duplicati`
   - La colección se creará automáticamente al insertar el primer documento

## 📊 Estructura de Datos

La aplicación buscará datos en:
- **Database**: `LTSM`
- **Collection**: `duplicati`

El esquema de cada documento debe tener estos campos principales:

```javascript
{
  MachineName: "SERVIDOR-01",           // Requerido
  BackupName: "Backup Documentos",
  BackupId: "backup-001",
  Status: "SUCCESS",                     // SUCCESS | WARNING | PARTIAL | ERROR
  EndTime: ISODate("2024-01-15T10:30:00Z"),
  ExaminedFiles: 1500,
  SizeOfExaminedFilesMB: 2048,
  QuotaUsagePercent: 45.5,
  // ... más campos
}
```

## 🧪 Verificar Conexión

### Opción 1: Desde MongoDB Compass

1. Abre MongoDB Compass
2. Conecta usando tu URI:
   ```
   mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM
   ```
3. Verifica que veas:
   - Base de datos: `LTSM`
   - Colección: `duplicati`
   - Documentos dentro de la colección

### Opción 2: Desde la Aplicación

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

2. Abre la consola del navegador (F12)

3. Ve a la pestaña Network

4. Recarga la página y busca la llamada a `/api/machines`

5. Verifica la respuesta:
   - ✅ **Éxito**: Recibirás un array de máquinas
   - ❌ **Error**: Verás un error de conexión

### Opción 3: Probar la API directamente

Abre tu navegador y ve a:
```
http://localhost:3000/api/machines
```

**Respuesta esperada** (si hay datos):
```json
[
  {
    "machineName": "SERVIDOR-01",
    "latestBackup": { ... },
    "totalBackups": 150,
    "successRate": 98.5,
    ...
  }
]
```

**Respuesta si NO hay datos**:
```json
[]
```

## 🔧 Solución de Problemas

### Error: "MongoServerError: bad auth"
**Problema**: Credenciales incorrectas

**Solución**:
1. Verifica usuario y contraseña en MongoDB Atlas > Database Access
2. Si la contraseña tiene caracteres especiales, usa encoding:
   ```javascript
   const password = encodeURIComponent("Mi@Pass#123");
   // mongodb+srv://usuario:Mi%40Pass%23123@cluster...
   ```

### Error: "MongoNetworkError: connection timeout"
**Problema**: IP no autorizada

**Solución**:
1. Ve a MongoDB Atlas > Network Access
2. Agrega tu IP actual
3. O agrega `0.0.0.0/0` para permitir todas (solo desarrollo)

### Error: "No data found"
**Problema**: La colección está vacía o tiene otro nombre

**Solución**:
1. Verifica que la colección se llama exactamente `duplicati` (minúsculas)
2. Inserta datos de prueba (ver abajo)
3. Verifica que estás conectado a la base de datos `LTSM`

## 📝 Insertar Datos de Prueba

### Usando MongoDB Compass

1. Conecta a tu cluster
2. Selecciona la base de datos: `LTSM`
3. Selecciona o crea la colección: `duplicati`
4. Click en "ADD DATA" > "Insert Document"
5. Pega este JSON:

```json
{
  "MachineName": "SERVIDOR-PRUEBA",
  "BackupName": "Backup de Prueba",
  "BackupId": "test-001",
  "Status": "SUCCESS",
  "ParsedResult": "Success",
  "PartialBackup": false,
  "Interrupted": false,
  "BeginTime": { "$date": "2024-01-15T08:00:00.000Z" },
  "EndTime": { "$date": "2024-01-15T08:30:00.000Z" },
  "RelativeEndTime": "30 minutes ago",
  "Duration": "00:30:00",
  "MainOperation": "Backup",
  "Version": "2.0.7.1",
  "ExaminedFiles": 1500,
  "OpenedFiles": 1200,
  "AddedFiles": 45,
  "ModifiedFiles": 23,
  "DeletedFiles": 5,
  "DeletedFolders": 1,
  "AddedFolders": 2,
  "FilesWithError": 0,
  "NotProcessedFiles": 0,
  "SizeOfExaminedFilesMB": 2048,
  "SizeOfAddedFilesMB": 125,
  "LastBackupDate": { "$date": "2024-01-15T08:30:00.000Z" },
  "BackupListCount": 150,
  "BytesDownloadedMB": 0,
  "BytesUploadedMB": 125,
  "FilesUploaded": 68,
  "FilesDownloaded": 0,
  "FilesDeleted": 5,
  "RemoteCalls": 45,
  "RetryAttempts": 0,
  "FreeQuotaSpaceMB": 48000,
  "TotalQuotaSpaceMB": 102400,
  "UsedQuotaSpaceMB": 54400,
  "QuotaUsagePercent": 53.1,
  "WarningsCount": 0,
  "ErrorsCount": 0,
  "MessagesCount": 5,
  "LogLines": [],
  "HasErrors": false,
  "ReceivedAt": { "$date": "2024-01-15T08:30:00.000Z" },
  "ExecutionMode": "Scheduled"
}
```

6. Click "Insert"

### Usando mongosh (MongoDB Shell)

```javascript
// Conectar
mongosh "mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM"

// Usar la base de datos
use LTSM

// Insertar documento de prueba
db.duplicati.insertOne({
  MachineName: "SERVIDOR-PRUEBA",
  BackupName: "Backup de Prueba",
  BackupId: "test-001",
  Status: "SUCCESS",
  ParsedResult: "Success",
  PartialBackup: false,
  Interrupted: false,
  BeginTime: new Date("2024-01-15T08:00:00Z"),
  EndTime: new Date("2024-01-15T08:30:00Z"),
  RelativeEndTime: "30 minutes ago",
  Duration: "00:30:00",
  MainOperation: "Backup",
  Version: "2.0.7.1",
  ExaminedFiles: 1500,
  OpenedFiles: 1200,
  AddedFiles: 45,
  ModifiedFiles: 23,
  DeletedFiles: 5,
  DeletedFolders: 1,
  AddedFolders: 2,
  FilesWithError: 0,
  NotProcessedFiles: 0,
  SizeOfExaminedFilesMB: 2048,
  SizeOfAddedFilesMB: 125,
  LastBackupDate: new Date("2024-01-15T08:30:00Z"),
  BackupListCount: 150,
  BytesDownloadedMB: 0,
  BytesUploadedMB: 125,
  FilesUploaded: 68,
  FilesDownloaded: 0,
  FilesDeleted: 5,
  RemoteCalls: 45,
  RetryAttempts: 0,
  FreeQuotaSpaceMB: 48000,
  TotalQuotaSpaceMB: 102400,
  UsedQuotaSpaceMB: 54400,
  QuotaUsagePercent: 53.1,
  WarningsCount: 0,
  ErrorsCount: 0,
  MessagesCount: 5,
  LogLines: [],
  HasErrors: false,
  ReceivedAt: new Date(),
  ExecutionMode: "Scheduled"
})

// Verificar
db.duplicati.find().pretty()
```

## 🔍 Verificar que Todo Funciona

1. **Verifica la conexión**:
   ```bash
   pnpm dev
   ```

2. **Abre el navegador**:
   ```
   http://localhost:3000
   ```

3. **Deberías ver**:
   - Una tarjeta para "SERVIDOR-PRUEBA"
   - Estado: SUCCESS (verde)
   - Health score calculado
   - Estadísticas en el header

4. **Si no ves datos**:
   - Abre la consola del navegador (F12)
   - Ve a la pestaña Console
   - Busca errores en rojo
   - Ve a la pestaña Network
   - Busca la llamada a `/api/machines`
   - Verifica el status code y la respuesta

## 📋 Checklist de Configuración

- [ ] URI de MongoDB correcta en `.env.local`
- [ ] Base de datos: `LTSM`
- [ ] Colección: `duplicati`
- [ ] IP autorizada en MongoDB Atlas
- [ ] Usuario con permisos correctos
- [ ] Al menos un documento de prueba insertado
- [ ] Servidor de desarrollo corriendo (`pnpm dev`)
- [ ] Dashboard abierto en `http://localhost:3000`
- [ ] Datos visibles en el dashboard

## 🆘 Soporte Adicional

Si sigues teniendo problemas:

1. **Verifica los logs del servidor**:
   - Revisa la terminal donde ejecutaste `pnpm dev`
   - Busca errores de conexión a MongoDB

2. **Habilita debug de Mongoose**:
   ```javascript
   // En src/lib/mongodb.ts, agrega antes del connect:
   mongoose.set('debug', true);
   ```

3. **Verifica variables de entorno**:
   ```javascript
   // En cualquier API route, agrega temporalmente:
   console.log('MONGODB_URI:', process.env.MONGODB_URI);
   ```

4. **Prueba la conexión directamente**:
   ```bash
   mongosh "tu-uri-completa"
   ```

---

**¿Necesitas ayuda?**
- Revisa los logs del servidor
- Verifica la configuración en MongoDB Atlas
- Asegúrate de que `.env.local` existe y tiene la URI correcta
- Reinicia el servidor después de cambiar `.env.local`
