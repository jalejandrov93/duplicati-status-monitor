# 🔧 Solución a los Problemas

## ✅ Problemas Resueltos

### 1. Error de TypeScript en `mongodb.ts`
**✓ SOLUCIONADO**

Se corrigió el error de tipos en `global.d.ts`:

```typescript
// Antes (incorrecto):
conn: typeof mongoose | null;

// Después (correcto):
conn: mongoose.Mongoose | null;
```

### 2. Nombre de la Colección
**✓ CONFIGURADO**

La aplicación ahora usa la colección `duplicati` correctamente:

- **Base de datos**: `LTSM`
- **Colección**: `duplicati`

Esto se configuró en `src/models/Backup.ts` agregando:

```typescript
{
  collection: "duplicati",  // ← Nombre de la colección
  timestamps: true,
}
```

## 📝 Pasos para Configurar MongoDB

### Paso 1: Instalar Dependencias

```bash
pnpm install
```

Esto instalará `dotenv` que se agregó como dependencia de desarrollo.

### Paso 2: Configurar `.env.local`

1. Copia el archivo de ejemplo:
   ```bash
   copy .env.local.example .env.local
   ```

2. Edita `.env.local` y configura tu URI de MongoDB Atlas:

   ```env
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM?retryWrites=true&w=majority
   ```

   **Reemplaza:**
   - `usuario` → Tu usuario de MongoDB Atlas
   - `contraseña` → Tu contraseña (si tiene caracteres especiales, usa encoding)
   - `cluster` → El nombre de tu cluster
   - `LTSM` → Nombre de la base de datos (YA ESTÁ CORRECTO)

   **Ejemplo real:**
   ```env
   MONGODB_URI=mongodb+srv://admin:MiPassword123@cluster0.abc123.mongodb.net/LTSM?retryWrites=true&w=majority
   ```

### Paso 3: Verificar Conexión a MongoDB

Antes de ejecutar la aplicación, prueba la conexión:

```bash
pnpm test:db
```

Este comando ejecutará `test-connection.js` que verificará:
- ✓ Que la URI sea válida
- ✓ Que se pueda conectar a MongoDB
- ✓ Que la base de datos `LTSM` exista
- ✓ Que la colección `duplicati` exista
- ✓ Cuántos documentos hay en la colección

**Salida esperada (si todo está bien):**

```
========================================
   VERIFICACIÓN DE CONEXIÓN A MONGODB
========================================

✓ URI de MongoDB encontrada
  mongodb+srv://admin:****@cluster0.mongodb.net/LTSM

Conectando a MongoDB...
✓ Conexión exitosa a MongoDB Atlas

Base de datos: LTSM

Colecciones encontradas:
  ✓ duplicati

✓ Colección "duplicati" encontrada
  Documentos en la colección: 5

========================================
   RESUMEN
========================================
✓ Conexión a MongoDB: OK
✓ Base de datos: LTSM
✓ Colección "duplicati": Existe
✓ Documentos: 5

✅ ¡Todo listo! Puedes ejecutar "pnpm dev"
```

### Paso 4: Insertar Datos de Prueba (si la colección está vacía)

Si `pnpm test:db` dice que la colección está vacía, inserta datos de prueba:

**Opción A: MongoDB Compass (Recomendado)**

1. Abre MongoDB Compass
2. Conecta usando tu URI
3. Ve a la base de datos `LTSM`
4. Crea o selecciona la colección `duplicati`
5. Click en "ADD DATA" → "Insert Document"
6. Pega el JSON de ejemplo (ver abajo)
7. Click "Insert"

**Opción B: mongosh**

```bash
mongosh "mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM"

use LTSM

db.duplicati.insertOne({
  MachineName: "SERVIDOR-PRUEBA",
  BackupName: "Backup de Prueba",
  BackupId: "test-001",
  Status: "SUCCESS",
  ParsedResult: "Success",
  PartialBackup: false,
  Interrupted: false,
  BeginTime: new Date("2024-01-15T08:00:00Z"),
  EndTime: new Date(),
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
  LastBackupDate: new Date(),
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
```

<details>
<summary><strong>Click aquí para ver el JSON completo para MongoDB Compass</strong></summary>

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
  "EndTime": { "$date": { "$numberLong": "1705315800000" } },
  "RelativeEndTime": "Just now",
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
  "LastBackupDate": { "$date": { "$numberLong": "1705315800000" } },
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
  "ReceivedAt": { "$date": { "$numberLong": "1705315800000" } },
  "ExecutionMode": "Scheduled"
}
```

</details>

### Paso 5: Ejecutar la Aplicación

```bash
pnpm dev
```

Abre tu navegador en: `http://localhost:3000`

Deberías ver:
- ✅ La tarjeta del servidor "SERVIDOR-PRUEBA"
- ✅ Estado: SUCCESS (verde)
- ✅ Métricas del backup
- ✅ Estadísticas en el header

## 🚨 Solución de Problemas Comunes

### Problema: "bad auth" o "Authentication failed"

**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Ve a MongoDB Atlas → Database Access
2. Verifica el usuario y contraseña
3. Si la contraseña tiene caracteres especiales (@, #, %, etc.):
   ```javascript
   // Codifica la contraseña
   Mi@Pass#123 → Mi%40Pass%23123
   ```
4. Usa la contraseña codificada en la URI

### Problema: "connection timeout" o "ENOTFOUND"

**Causa:** IP no autorizada o problemas de red

**Solución:**
1. Ve a MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Para desarrollo: usa `0.0.0.0/0` (permite todas las IPs)
4. Para producción: usa tu IP específica
5. Verifica tu conexión a internet

### Problema: "No data found" o dashboard vacío

**Causa:** La colección está vacía o no existe

**Solución:**
1. Ejecuta `pnpm test:db` para verificar
2. Inserta datos de prueba (ver Paso 4)
3. Verifica que la colección se llame exactamente `duplicati` (minúsculas)
4. Verifica que estés usando la base de datos `LTSM`

### Problema: Cambios en `.env.local` no se aplican

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Reinicia: `pnpm dev`
3. Next.js carga variables de entorno al inicio

## 📋 Checklist Final

Antes de reportar un problema, verifica:

- [ ] ✓ Instalaste dependencias: `pnpm install`
- [ ] ✓ Creaste `.env.local` desde `.env.local.example`
- [ ] ✓ Configuraste `MONGODB_URI` con tu URI real
- [ ] ✓ La URI incluye el nombre de la base de datos: `/LTSM?`
- [ ] ✓ Tu IP está autorizada en MongoDB Atlas (Network Access)
- [ ] ✓ El usuario tiene permisos (Database Access)
- [ ] ✓ Ejecutaste `pnpm test:db` exitosamente
- [ ] ✓ La colección `duplicati` existe en la base de datos `LTSM`
- [ ] ✓ Hay al menos un documento en la colección
- [ ] ✓ Ejecutaste `pnpm dev`
- [ ] ✓ Abriste `http://localhost:3000`

## 🎯 Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Probar conexión a MongoDB
pnpm test:db

# Ejecutar en desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar en producción
pnpm start
```

## 📚 Documentación Adicional

- **MONGODB_SETUP.md** - Guía completa de MongoDB
- **README.md** - Documentación principal
- **QUICK_START.md** - Inicio rápido

## ✅ Resumen de Cambios Realizados

1. **Corregido error de TypeScript** en `global.d.ts`
2. **Configurada colección** `duplicati` en `src/models/Backup.ts`
3. **Actualizado** `.env.local.example` con instrucciones claras
4. **Creado** `test-connection.js` para verificar la conexión
5. **Agregado** script `pnpm test:db` en `package.json`
6. **Creada** documentación `MONGODB_SETUP.md`

---

**¿Necesitas más ayuda?**

1. Ejecuta `pnpm test:db` y comparte la salida
2. Revisa los logs del servidor cuando ejecutas `pnpm dev`
3. Verifica la consola del navegador (F12) en la pestaña Network
4. Consulta MONGODB_SETUP.md para más detalles
