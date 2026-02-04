# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Duplicati Backup Monitor** - A Next.js 16 application for real-time monitoring and visualization of Duplicati backup reports. The application receives backup status via webhooks and displays comprehensive dashboards with health scores, statistics, and historical data.

**Language:** All user-facing text is in Spanish (España).

**Stack:**
- Next.js 16.1.6 with App Router
- React 19.2.4
- TypeScript 5.9.3
- MongoDB Atlas (Mongoose 9.1.5)
- TanStack Query (React Query) v5
- Tailwind CSS 4.1.18 + shadcn/ui components
- Recharts for data visualization

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (port 3000)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Testing & Diagnostics
pnpm test:db          # Test MongoDB connection
pnpm test:demo        # Run demo data script
pnpm test:mongoose    # Test MongoDB native driver
pnpm diagnostico      # Run complete diagnostic

# Code Quality
pnpm lint             # Run ESLint
```

## Environment Setup

Required environment variable in `.env.local`:

```
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM?retryWrites=true&w=majority
```

- **Database name:** `LTSM`
- **Collection:** `duplicati` (auto-configured in Mongoose model)

## Architecture

### Data Flow

1. **Webhook Reception** (`/api/webhook/duplicati`)
   - Duplicati sends POST requests with backup reports
   - Data is transformed and normalized (bytes → MB, status mapping)
   - Stored in MongoDB `duplicati` collection

2. **Data Aggregation** (API Routes)
   - Machine-level statistics via MongoDB aggregation pipelines
   - Health score calculation (0-100) based on:
     - Success rate (40 points)
     - Quota usage (20 points)
     - Recent backup presence (20 points)
     - Error count (20 points)

3. **Real-time Updates** (Frontend)
   - TanStack Query with 15-second auto-refresh
   - Toast notifications for errors/warnings on initial load
   - Dashboard shows machines sorted by health score (worst first)

### Key Architectural Patterns

**MongoDB Connection Management:**
- Singleton pattern with global caching (`src/lib/mongodb.ts`)
- Prevents multiple connections in serverless environment
- Connection reused across API routes

**API Route Structure:**
- `/api/machines` - List all machines with latest backup
- `/api/machines/[machineName]` - Detailed machine statistics
- `/api/machines/[machineName]/history` - Paginated backup history
- `/api/stats` - Global dashboard statistics
- `/api/webhook/duplicati` - Webhook endpoint for Duplicati

**Component Architecture:**
- `src/app/page.tsx` - Main dashboard (client component)
- `src/app/machine/[machineName]/page.tsx` - Machine detail page
- `src/components/machine-card.tsx` - Machine status card with visual monitor design
- `src/components/dashboard-header.tsx` - Global stats and search
- `src/components/backup-history-table.tsx` - Expandable history with CSV export
- `src/components/backup-charts.tsx` - 4 Recharts visualizations
- `src/components/providers.tsx` - Query client and theme provider setup

### MongoDB Schema

**Backup Document** (`src/models/Backup.ts`):
- Collection: `duplicati`
- Indexes: `MachineName`, `EndTime`, `Status`, compound indexes for efficient queries
- Key fields: Status (SUCCESS/WARNING/PARTIAL/ERROR), file metrics, quota usage, error details

### State Management

- **TanStack Query** for server state (15s stale time, auto-refetch)
- **React hooks** for local UI state (search, pagination, expanded rows)
- **next-themes** for dark/light mode
- **sonner** for toast notifications

## Translation Requirements

**All user-facing text must be in Spanish:**
- Component labels and buttons
- Status messages: "Éxito", "Advertencia", "Error", "Parcial"
- Health scores: "Excelente", "Bueno", "Regular", "Deficiente"
- API error messages returned to frontend
- Date/time formatting should use Spanish locale when applicable

**Data from backend** (machine names, exception messages, log lines) can remain in original language.

## Important Implementation Details

### Health Score Calculation
Located in `src/lib/utils.ts` - `calculateHealthScore()`:
- Success rate impact: 40% weight
- Quota usage penalties: >90% (-20), >80% (-10), >70% (-5)
- Recent backup check: within 48 hours (+20 if true)
- Error count: -5 points per error (max -20)

### Webhook Data Transformation
The webhook endpoint handles multiple field name formats:
- `MachineName` or `MACHINE_NAME`
- Byte values converted to MB for storage
- Relative time strings generated server-side
- Status normalization from various formats

### Machine Card Visual Design
`src/components/machine-card.tsx` uses a monitor/screen metaphor:
- Border color changes based on status (green/yellow/red)
- Pulsing indicator dot for status
- Hover effects with glow
- Monitor stand base visual at bottom
- Full height cards with responsive layout

### API Aggregation Patterns
Complex MongoDB aggregations used throughout:
- `$facet` for parallel aggregations (summary + latest + recent)
- `$group` with `$first` for latest backup per machine
- Status-based conditional counting
- Sorted by EndTime descending

## Common Development Scenarios

**Adding a new status type:**
1. Update `BackupStatus` type in `src/types/backup.ts`
2. Update `mapStatus()` in webhook route
3. Add color/icon mapping in `getStatusConfig()` in machine-card
4. Update Mongoose schema enum in `src/models/Backup.ts`

**Adding a new chart:**
1. Add to `src/components/backup-charts.tsx`
2. Process data from `recentBackups` array
3. Use Recharts components with Tailwind theme variables
4. Add Spanish title and axis labels

**Creating new API endpoint:**
1. Create route in `src/app/api/[path]/route.ts`
2. Import `connectDB` and `Backup` model
3. Use `export const dynamic = "force-dynamic"` for no caching
4. Return Spanish error messages for user-facing errors
5. Use aggregation pipelines for complex queries

## shadcn/ui Components Used

The project uses shadcn/ui components located in `src/components/ui/`:
- Badge, Button, Card, Input, Progress
- All styled with Tailwind CSS
- Theme-aware (light/dark mode via next-themes)

## Deployment Considerations

- MongoDB Atlas connection required
- Webhook URL must be configured in Duplicati clients
- Environment variables must be set in production
- Next.js serverless functions handle API routes
- Static pages: none (all dynamic due to real-time data)
