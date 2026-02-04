# Duplicati Backup Monitor

A modern, real-time monitoring dashboard for Duplicati backup reports built with Next.js 14, TypeScript, MongoDB, and shadcn/ui.

![Dashboard Preview](./docs/dashboard.png)

## Features

### 🎯 Main Dashboard
- **Real-time Updates**: Auto-refresh every 15 seconds
- **Responsive Grid Layout**: 1-4 columns based on screen size
- **Color-coded Status Cards**: Visual status indicators (Success/Warning/Error/Partial)
- **Machine Health Scores**: Comprehensive health assessment for each machine
- **Smart Notifications**: Toast alerts for errors and warnings on page load
- **Quick Search**: Filter machines by name
- **Global Statistics**: Overview of all machines and their status

### 📊 Machine Detail View
- **Key Metrics Cards**: Health score, total backups, success rate, quota usage
- **Interactive Charts**:
  - Backup size trend (Area chart)
  - Status distribution (Pie chart)
  - Files processed (Bar chart)
  - Duration trend (Line chart)
- **Backup History Table**:
  - Sortable and paginated
  - Expandable rows for detailed information
  - Export to CSV functionality
- **Error Details**: Exception logs and retry information
- **Additional Operations**: Compact, Delete, Test results

### 🎨 UI/UX Features
- **Dark Mode Support**: Seamless theme switching
- **Smooth Animations**: Transitions and loading states
- **Professional Design**: Modern, clean interface
- **Accessible**: ARIA labels, keyboard navigation
- **Responsive**: Mobile-first design
- **Loading States**: Skeleton screens and shimmer effects

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack React Query (auto-refresh)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18+
- MongoDB 4.4+
- npm or yarn

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd backup_duplicati
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/duplicati
```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application expects a MongoDB collection named `backups` with the following structure:

```typescript
{
  MachineName: string,
  BackupName: string,
  BackupId: string,
  Status: "SUCCESS" | "WARNING" | "PARTIAL" | "ERROR",
  ParsedResult: string,
  PartialBackup: boolean,
  Interrupted: boolean,
  BeginTime: Date,
  EndTime: Date,
  RelativeEndTime: string,
  Duration: string,
  MainOperation: string,
  Version: string,
  ExaminedFiles: number,
  OpenedFiles: number,
  AddedFiles: number,
  ModifiedFiles: number,
  DeletedFiles: number,
  DeletedFolders: number,
  AddedFolders: number,
  FilesWithError: number,
  NotProcessedFiles: number,
  SizeOfExaminedFilesMB: number,
  SizeOfAddedFilesMB: number,
  LastBackupDate: Date,
  BackupListCount: number,
  BytesDownloadedMB: number,
  BytesUploadedMB: number,
  FilesUploaded: number,
  FilesDownloaded: number,
  FilesDeleted: number,
  RemoteCalls: number,
  RetryAttempts: number,
  FreeQuotaSpaceMB: number,
  TotalQuotaSpaceMB: number,
  UsedQuotaSpaceMB: number,
  QuotaUsagePercent: number,
  WarningsCount: number,
  ErrorsCount: number,
  MessagesCount: number,
  LogLines: string[],
  Exception: string,
  HasErrors: boolean,
  AdditionalOperations: Array<{
    operation: string,
    result: string,
    details: any
  }>,
  ReceivedAt: Date,
  WebhookUrl: string,
  ExecutionMode: string
}
```

## API Endpoints

### GET /api/machines
Returns all machines with their latest backup status and statistics.

**Response**:
```json
[
  {
    "machineName": "SERVER-01",
    "latestBackup": { ... },
    "totalBackups": 150,
    "successRate": 98.5,
    "averageSize": 1024,
    "lastSuccessfulBackup": "2024-01-15T10:30:00Z",
    "currentQuotaUsage": 45.2,
    "healthScore": 95
  }
]
```

### GET /api/machines/[machineName]
Returns detailed information for a specific machine.

**Response**:
```json
{
  "machineName": "SERVER-01",
  "latestBackup": { ... },
  "totalBackups": 150,
  "successRate": 98.5,
  "statusDistribution": {
    "success": 148,
    "warning": 2,
    "error": 0,
    "partial": 0
  },
  "recentBackups": [ ... ],
  "healthScore": 95
}
```

### GET /api/machines/[machineName]/history
Returns paginated backup history for a machine.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): Filter by status
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response**:
```json
{
  "backups": [ ... ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### GET /api/stats
Returns global statistics across all machines.

**Response**:
```json
{
  "totalMachines": 10,
  "successfulMachines": 8,
  "warningMachines": 1,
  "errorMachines": 1,
  "totalBackups": 1500,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Project Structure

```
backup_duplicati/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── machines/
│   │   │   │   ├── [machineName]/
│   │   │   │   │   ├── history/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   ├── machine/
│   │   │   └── [machineName]/
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── progress.tsx
│   │   ├── backup-charts.tsx
│   │   ├── backup-history-table.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── machine-card.tsx
│   │   ├── providers.tsx
│   │   └── server-icon.tsx
│   ├── lib/
│   │   ├── mongodb.ts
│   │   └── utils.ts
│   ├── models/
│   │   └── Backup.ts
│   └── types/
│       └── backup.ts
├── .env.local.example
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Configuration

### Auto-Refresh Interval
The dashboard auto-refreshes every 15 seconds. To change this, modify the `refetchInterval` in `src/components/providers.tsx`:

```typescript
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 15 * 1000,
          refetchInterval: 15 * 1000, // Change this value
        },
      },
    })
);
```

### Health Score Calculation
Health scores are calculated based on:
- **Success Rate** (40 points)
- **Quota Usage** (20 points)
- **Recent Backup** (20 points)
- **Error Count** (20 points)

Modify the algorithm in `src/lib/utils.ts`:

```typescript
export function calculateHealthScore(
  successRate: number,
  quotaUsage: number,
  hasRecentBackup: boolean,
  errorCount: number
): number {
  // Customize scoring logic here
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t duplicati-monitor .
docker run -p 3000:3000 -e MONGODB_URI=your_connection_string duplicati-monitor
```

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Roadmap

- [ ] Email notifications for critical errors
- [ ] Backup schedule display and management
- [ ] Alert threshold configuration
- [ ] User authentication and roles
- [ ] Multi-language support
- [ ] Advanced filtering and sorting
- [ ] Backup comparison tool
- [ ] Historical trend analysis
- [ ] Custom dashboard widgets
- [ ] Mobile app

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
