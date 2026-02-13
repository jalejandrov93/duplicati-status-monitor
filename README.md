# 🗄️ Duplicati Backup Monitor

<div align="center">

![Dashboard Preview](./public/dashboard.png)

**Una plataforma moderna de monitoreo en tiempo real para tus backups de Duplicati**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

[Características](#-características) •
[Demo](#-demo) •
[Instalación](#-instalación) •
[Documentación](#-documentación) •
[Contribuir](#-contribuir)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
  - [Desarrollo Local](#desarrollo-local)
  - [Docker (Recomendado)](#docker-recomendado)
  - [Producción](#producción)
- [Configuración](#-configuración)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de Datos](#-flujo-de-datos)
- [Health Score](#-health-score)
- [Próximos Pasos](#-próximos-pasos)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Acerca del Proyecto

**Duplicati Backup Monitor** es una aplicación web moderna diseñada para monitorear y visualizar el estado de tus respaldos de [Duplicati](https://www.duplicati.com/) en tiempo real. Construida con las últimas tecnologías web, ofrece un dashboard interactivo, gráficos estadísticos y un sistema de puntuación de salud para evaluar el estado de tus backups.

### ¿Por qué este proyecto?

- **Visibilidad Centralizada**: Monitorea múltiples máquinas con Duplicati desde un solo lugar
- **Alertas Proactivas**: Sistema de Health Score que identifica problemas antes de que se conviertan en fallas
- **Análisis Histórico**: Visualiza tendencias y patrones en tus respaldos a lo largo del tiempo
- **Interfaz Moderna**: UI responsiva con animaciones fluidas y tema oscuro/claro
- **Fácil Despliegue**: Listo para producción con Docker y GitHub Actions

---

## ✨ Características

### 🖥️ Dashboard Principal
- **Estadísticas Globales**: Vista general de todas tus máquinas (exitosas, con advertencias, errores)
- **Tarjetas de Máquina**: Visualización individual con estado, tasa de éxito y última ejecución
- **Health Score**: Puntuación calculada en tiempo real (0-100) basada en múltiples factores
- **Búsqueda y Filtrado**: Encuentra rápidamente máquinas específicas
- **Actualización Automática**: Refetch cada 60 segundos para datos siempre actualizados

### 📊 Vista de Detalle de Máquina
- **Métricas Detalladas**: Respaldos totales, tasa de éxito, uso de cuota, puntuación de salud
- **Gráficos Interactivos**:
  - Tamaño de backup a lo largo del tiempo (Area Chart)
  - Distribución de estados (Pie Chart)
  - Archivos procesados por backup (Bar Chart)
  - Duración de backups (Line Chart)
- **Historial de Backups**: Tabla paginada con búsqueda y exportación a CSV
- **Detalles de Errores**: Panel expandible con excepciones y logs completos

### 🎨 UI/UX
- **Tema Oscuro/Claro**: Cambio dinámico con persistencia
- **Animaciones Fluidas**: Transiciones con Framer Motion
- **Diseño Responsivo**: Optimizado para móviles, tablets y escritorio
- **Notificaciones Toast**: Alertas no intrusivas con Sonner
- **Carga Progresiva**: Estados de loading elegantes

### 🔧 Técnicas
- **API RESTful**: Endpoints bien estructurados para máquinas, estadísticas e historial
- **Webhook Integrado**: Recibe reportes directamente de Duplicati
- **Caching Inteligente**: React Query con invalidación automática
- **Optimización de Consultas**: Aggregation pipelines de MongoDB con índices
- **Type Safety**: TypeScript en todo el stack (frontend + backend)

---

## 🛠️ Tecnologías

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[React 19](https://react.dev/)** - Librería UI con Server Components
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones fluidas
- **[TanStack React Query](https://tanstack.com/query)** - Gestión de estado del servidor
- **[TanStack React Table](https://tanstack.com/table)** - Tablas potentes y flexibles
- **[Recharts](https://recharts.org/)** - Gráficos responsivos
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI accesibles
- **[Lucide React](https://lucide.dev/)** - Iconos modernos
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Gestión de temas
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificaciones toast

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless functions
- **[MongoDB 7](https://www.mongodb.com/)** - Base de datos NoSQL
- **[Mongoose 9](https://mongoosejs.com/)** - ODM para MongoDB
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas

### DevOps
- **[Docker](https://www.docker.com/)** - Containerización
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestación local
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automatizado
- **[GitHub Container Registry](https://ghcr.io)** - Registro de imágenes Docker
- **[pnpm](https://pnpm.io/)** - Package manager eficiente

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   DUPLICATI MACHINES                         │
│              (Enviando reportes via webhook)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/webhook/duplicati
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  - Transform & validate data                         │  │
│  │  - Calculate Health Score                            │  │
│  │  - Save to MongoDB                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │    MONGODB (Cloud/Local)       │
        │    Collection: "duplicati"     │
        │    - Indexes optimizados       │
        │    - Aggregation pipelines     │
        └────────────────┬───────────────┘
                         │
        ┌────────────────▼────────────────┐
        │    API ENDPOINTS                │
        │  - GET /api/machines            │
        │  - GET /api/stats               │
        │  - GET /api/machines/[name]     │
        │  - GET /api/machines/[name]/    │
        │    history?page=1               │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   REACT QUERY (Client Cache)    │
        │  - staleTime: 15s               │
        │  - refetchInterval: 15-60s      │
        │  - Deduplicación automática     │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   NEXT.JS APP ROUTER            │
        │   - Server Components           │
        │   - Client Components           │
        │   - Dynamic Routes              │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   COMPONENTS + UI               │
        │   - Dashboard                   │
        │   - Machine Details             │
        │   - Charts & Tables             │
        └─────────────────────────────────┘
```

### Flujo de Ingesta de Datos

```
1. Duplicati ejecuta backup
      ↓
2. Duplicati envía reporte POST a /api/webhook/duplicati
      ↓
3. API transforma datos:
   - Mapea status (SUCCESS, WARNING, PARTIAL, ERROR)
   - Convierte bytes a MB
   - Calcula QuotaUsagePercent
   - Parsea logs
      ↓
4. Guarda BackupDocument en MongoDB
      ↓
5. Dashboard detecta nuevos datos (refetch automático)
      ↓
6. UI actualiza en tiempo real
```

---

## 📥 Instalación

### Prerequisitos

- **Node.js 18+** (recomendado 20 o 24)
- **pnpm** (o npm/yarn)
- **MongoDB** (local o Atlas)
- **Docker** (opcional, para deployment)

### Desarrollo Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/jalejandrov93/backup-duplicati.git
   cd backup-duplicati
   ```

2. **Instala dependencias**
   ```bash
   # Con pnpm (recomendado)
   pnpm install

   # O con npm
   npm install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```

   Edita `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/duplicati
   # O con MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/duplicati?retryWrites=true&w=majority
   ```

4. **Inicia MongoDB** (si es local)
   ```bash
   # Con Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7

   # O usa tu instalación local
   ```

5. **Ejecuta el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

6. **Abre tu navegador**

   Visita [http://localhost:3000](http://localhost:3000)

### Docker (Recomendado)

La forma más rápida de ejecutar el proyecto en producción:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/jalejandrov93/backup-duplicati.git
   cd backup-duplicati
   ```

2. **Crea archivo `.env`**
   ```bash
   echo "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/duplicati" > .env
   ```

3. **Inicia con Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Accede a la aplicación**

   Visita [http://localhost:8191](http://localhost:8191)

#### Usando la imagen publicada

Puedes usar directamente la imagen publicada en GitHub Container Registry:

```bash
docker run -d \
  -p 8191:3000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/duplicati" \
  --name duplicati-monitor \
  ghcr.io/jalejandrov93/backup-duplicati:master
```

### Producción

#### Build Manual

```bash
# Build de la aplicación
pnpm build

# Inicia en producción
pnpm start
```

#### Build Docker

```bash
# Build de la imagen
docker build -t duplicati-monitor -f docker/Dockerfile .

# Ejecuta el contenedor
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  --name duplicati-monitor \
  duplicati-monitor
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `MONGODB_URI` | URI de conexión a MongoDB | ✅ | - |
| `NODE_ENV` | Entorno de ejecución | ❌ | `development` |
| `NEXT_TELEMETRY_DISABLED` | Deshabilitar telemetría de Next.js | ❌ | `1` |
| `PORT` | Puerto de la aplicación | ❌ | `3000` |

### Configuración de Duplicati

Para enviar reportes a este monitor, configura un webhook en Duplicati:

#### Opción A: Webhook Directo (Próximamente)

```bash
# URL del webhook
https://tu-dominio.com/api/webhook/duplicati

# Método: POST
# Headers: Content-Type: application/json
```

#### Opción B: Con n8n (Actual)

Actualmente, el flujo recomendado es usar n8n como intermediario:

```
Duplicati → n8n (escucha webhook) → transforma datos → MongoDB
                                   ↓
                            Duplicati Monitor (consume MongoDB)
```

> **Nota**: En la próxima versión, se implementará soporte para recibir webhooks directamente de Duplicati, eliminando la necesidad de n8n.

### MongoDB Setup

#### Opción 1: MongoDB Atlas (Cloud - Recomendado)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Whitelist tu IP (o `0.0.0.0/0` para desarrollo)
5. Obtén tu connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   ```

#### Opción 2: MongoDB Local

```bash
# Con Docker
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -v mongodb_data:/data/db \
  mongo:7

# Connection string
MONGODB_URI=mongodb://localhost:27017/duplicati
```

---

## 🔌 API Endpoints

### Webhook

#### `POST /api/webhook/duplicati`

Recibe reportes de backups de Duplicati.

**Request Body:**
```json
{
  "MachineName": "server-01",
  "BackupId": "backup-123",
  "Status": "SUCCESS",
  "BeginTime": "2026-02-13T10:00:00Z",
  "EndTime": "2026-02-13T10:30:00Z",
  "Duration": "00:30:00",
  "ExaminedFiles": 1000,
  "SizeOfExaminedFilesMB": 5000,
  "AddedFiles": 10,
  "ModifiedFiles": 5,
  "DeletedFiles": 2,
  "FilesWithError": 0,
  "ErrorsCount": 0,
  "WarningsCount": 0,
  "FreeQuotaSpaceMB": 50000,
  "TotalQuotaSpaceMB": 100000,
  "UsedQuotaSpaceMB": 50000,
  "LogLines": ["Log line 1", "Log line 2"]
}
```

**Response:**
```json
{
  "success": true,
  "machineName": "server-01"
}
```

### Consulta de Datos

#### `GET /api/machines`

Obtiene lista de todas las máquinas con sus estadísticas.

**Response:**
```json
[
  {
    "_id": "server-01",
    "totalBackups": 150,
    "successCount": 145,
    "successRate": 96.67,
    "lastBackup": {
      "EndTime": "2026-02-13T10:30:00Z",
      "Status": "SUCCESS",
      "Duration": "00:30:00"
    },
    "totalSize": 750000,
    "averageSize": 5000,
    "lastSuccessful": "2026-02-13T10:30:00Z",
    "healthScore": 95,
    "currentQuotaUsage": 50
  }
]
```

#### `GET /api/stats`

Obtiene estadísticas globales del sistema.

**Response:**
```json
{
  "totalMachines": 10,
  "successfulMachines": 8,
  "warningMachines": 1,
  "errorMachines": 1,
  "totalBackups": 1500,
  "lastUpdated": "2026-02-13T10:30:00Z"
}
```

#### `GET /api/machines/[machineName]`

Obtiene detalles completos de una máquina específica.

**Response:**
```json
{
  "machineName": "server-01",
  "totalBackups": 150,
  "successCount": 145,
  "successRate": 96.67,
  "averageSize": 5000,
  "healthScore": 95,
  "statusDistribution": {
    "success": 145,
    "warning": 3,
    "error": 2,
    "partial": 0
  },
  "latestBackup": { /* backup completo */ },
  "recentBackups": [ /* últimos 30 */ ]
}
```

#### `GET /api/machines/[machineName]/history`

Obtiene historial paginado de backups.

**Query Parameters:**
- `page` (number): Página actual (default: 1)
- `limit` (number): Resultados por página (default: 20)
- `status` (string): Filtrar por estado (opcional)
- `startDate` (string): Fecha inicio (ISO 8601, opcional)
- `endDate` (string): Fecha fin (ISO 8601, opcional)

**Response:**
```json
{
  "backups": [ /* array de backups */ ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

## 📁 Estructura del Proyecto

```
backup-duplicati/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Routes
│   │   │   ├── machines/           # Endpoints de máquinas
│   │   │   ├── stats/              # Estadísticas globales
│   │   │   └── webhook/            # Webhook de Duplicati
│   │   ├── machine/[machineName]/  # Vista de detalle
│   │   ├── layout.tsx              # Layout raíz
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── loading.tsx             # Loading global
│   │   └── not-found.tsx           # 404 page
│   │
│   ├── components/                 # Componentes React
│   │   ├── ui/                     # Componentes base (shadcn/ui)
│   │   ├── machine-detail/         # Componentes de detalle
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── machine-card.tsx
│   │   ├── backup-charts.tsx
│   │   ├── backup-history-table.tsx
│   │   └── providers.tsx           # React Query + Theme providers
│   │
│   ├── lib/                        # Utilidades
│   │   ├── mongodb.ts              # Conexión MongoDB (cached)
│   │   ├── utils.ts                # Helpers (healthScore, formatBytes)
│   │   └── animation-variants.ts   # Variantes Framer Motion
│   │
│   ├── models/                     # Schemas Mongoose
│   │   └── Backup.ts               # Modelo de Backup
│   │
│   ├── types/                      # Tipos TypeScript
│   │   ├── backup.ts
│   │   └── machine.ts
│   │
│   ├── hooks/                      # Custom hooks
│   │   └── use-machine-details.ts
│   │
│   └── app/globals.css             # Estilos globales
│
├── docker/
│   └── Dockerfile                  # Multi-stage Docker build
│
├── .github/
│   └── workflows/
│       └── docker-build-publish.yml # CI/CD con GitHub Actions
│
├── public/                         # Assets estáticos
│   ├── dashboard.png
│   └── ...
│
├── scripts/                        # Scripts de utilidad
│   ├── test-connection.js
│   └── diagnostico-completo.js
│
├── docker-compose.yml              # Compose para producción
├── package.json                    # Dependencias
├── tsconfig.json                   # Config TypeScript
├── tailwind.config.ts              # Config Tailwind
├── next.config.mjs                 # Config Next.js
└── README.md                       # Este archivo
```

---

## 🔄 Flujo de Datos

### 1. Ingesta de Datos (Webhook)

```typescript
// POST /api/webhook/duplicati
{
  MachineName: "server-01",
  Status: "SUCCESS",
  BeginTime: "2026-02-13T10:00:00Z",
  EndTime: "2026-02-13T10:30:00Z",
  // ... más campos
}
      ↓
   Transform
      ↓
{
  machineName: "server-01",
  status: "SUCCESS",
  beginTime: Date,
  endTime: Date,
  quotaUsagePercent: 50,  // Calculado
  logLines: ["..."],      // Parseado
  // ...
}
      ↓
  MongoDB Save
      ↓
Collection: duplicati
```

### 2. Consulta de Dashboard

```
Usuario accede a /
      ↓
React Query fetch:
  - /api/machines (lista con agregación)
  - /api/stats (estadísticas globales)
      ↓
Cache en cliente (15s stale time)
      ↓
Render MachineCards + DashboardStats
      ↓
Refetch automático cada 60s
```

### 3. Vista de Detalle

```
Click en MachineCard
      ↓
Navigate to /machine/server-01
      ↓
React Query fetch:
  - /api/machines/server-01 (aggregation pipeline)
  - /api/machines/server-01/history?page=1
      ↓
Render:
  - MachineDetailHeader
  - MachineMetricCards
  - BackupCharts (Recharts)
  - BackupHistoryTable (TanStack Table)
      ↓
Refetch automático cada 30s
```

---

## 📊 Health Score

El **Health Score** es una métrica calculada (0-100) que evalúa el estado general de una máquina basándose en múltiples factores:

### Algoritmo

```typescript
function calculateHealthScore(
  successRate: number,      // 0-100%
  quotaUsage: number,       // 0-100%
  hasRecentBackup: boolean, // < 48 horas
  errorCount: number        // Total de errores
): number {
  let score = 100;

  // Factor 1: Success Rate (peso 40%)
  score -= (100 - successRate) * 0.4;

  // Factor 2: Quota Usage (peso 20%)
  if (quotaUsage > 90) score -= 20;
  else if (quotaUsage > 80) score -= 10;
  else if (quotaUsage > 70) score -= 5;

  // Factor 3: Recent Backup (peso 20%)
  if (!hasRecentBackup) score -= 20;

  // Factor 4: Error Count (peso 20%)
  score -= Math.min(errorCount * 5, 20);

  return Math.max(0, Math.round(score));
}
```

### Interpretación

| Score | Color | Estado | Acción |
|-------|-------|--------|--------|
| 90-100 | 🟢 Verde | Excelente | Todo funciona correctamente |
| 75-89 | 🔵 Azul | Bueno | Monitorear regularmente |
| 60-74 | 🟡 Amarillo | Regular | Revisar advertencias |
| 0-59 | 🔴 Rojo | Deficiente | Requiere atención inmediata |

### Factores que Afectan el Score

- ✅ **Tasa de éxito alta** → Score mayor
- ⚠️ **Uso de cuota > 90%** → -20 puntos
- ❌ **No hay backup reciente** (>48h) → -20 puntos
- 🐛 **Errores frecuentes** → -5 por error (máx -20)

---

## 🚀 Próximos Pasos

### En Desarrollo

- [ ] **Webhook Directo de Duplicati**
  - Eliminar dependencia de n8n
  - Recibir reportes directamente desde Duplicati
  - Validación y transformación de datos en tiempo real
  - Autenticación con API key/token

- [ ] **Notificaciones**
  - Integración con Email (SMTP, SendGrid)
  - Integración con Telegram
  - Integración con Discord
  - Integración con Slack
  - Alertas personalizables por severidad

- [ ] **Alertas Inteligentes**
  - Detección de anomalías (ML)
  - Alertas cuando el Health Score baja de cierto umbral
  - Predicción de fallos basada en tendencias

- [ ] **Reportes Automáticos**
  - Generación de PDFs con estadísticas
  - Envío programado (diario, semanal, mensual)
  - Comparativa histórica

### Futuras Mejoras

- [ ] **Autenticación y Autorización**
  - Login con NextAuth.js
  - Roles (admin, viewer)
  - Multi-tenancy

- [ ] **Dashboard Personalizable**
  - Widgets arrastrables
  - Preferencias de usuario guardadas
  - Exportar/importar configuraciones

- [ ] **Integración con Duplicati CLI**
  - Ejecutar backups desde el dashboard
  - Ver logs en tiempo real
  - Pausar/reanudar tareas

- [ ] **Análisis Avanzado**
  - Predicción de uso de almacenamiento
  - Recomendaciones de optimización
  - Comparativa entre máquinas

- [ ] **Modo Multi-Tenant**
  - Soporte para múltiples organizaciones
  - Aislamiento de datos
  - Facturación integrada

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto de código abierto y nos encantaría tu ayuda.

### Cómo Contribuir

1. **Fork el proyecto**
2. **Crea una rama** para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit tus cambios** (`git commit -m 'feat: Add amazing feature'`)
4. **Push a la rama** (`git push origin feature/amazing-feature`)
5. **Abre un Pull Request**

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc
refactor: refactorización de código
test: añadir tests
chore: actualizar tareas de build, configs, etc
```

### Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/jalejandrov93/backup-duplicati/issues) con:

- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Información del entorno (SO, versión de Node, etc.)

### Solicitar Features

Para solicitar nuevas características, abre un [issue](https://github.com/jalejandrov93/backup-duplicati/issues) con:

- Descripción detallada de la feature
- Casos de uso
- Beneficios esperados
- Mockups o ejemplos (opcional)

---

## 📝 Licencia

Este proyecto está licenciado bajo la **MIT License**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2026 Alejandro Vásquez

Se permite el uso, copia, modificación, fusión, publicación, distribución,
sublicencia y/o venta de copias del Software, sujeto a las condiciones de la
Licencia MIT completa.
```

---

## 🙏 Agradecimientos

- [Duplicati](https://www.duplicati.com/) por el excelente software de backup
- [shadcn/ui](https://ui.shadcn.com/) por los componentes UI
- [Vercel](https://vercel.com/) por Next.js
- Comunidad de código abierto

---

## 📧 Contacto

**Alejandro Vásquez**
- GitHub: [@jalejandrov93](https://github.com/jalejandrov93)
- Proyecto: [backup-duplicati](https://github.com/jalejandrov93/backup-duplicati)

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐**

[Reportar Bug](https://github.com/jalejandrov93/backup-duplicati/issues) •
[Solicitar Feature](https://github.com/jalejandrov93/backup-duplicati/issues) •
[Documentación](https://github.com/jalejandrov93/backup-duplicati)

</div>
