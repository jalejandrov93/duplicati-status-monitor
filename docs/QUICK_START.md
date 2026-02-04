# Quick Start Guide

Get your Duplicati Backup Monitor up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, MongoDB driver, React Query, Recharts, and shadcn/ui components.

## Step 2: Setup MongoDB

### Option A: Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB:
   ```bash
   # Windows
   mongod --dbpath C:\data\db

   # macOS/Linux
   mongod --dbpath /data/db
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/duplicati`)

## Step 3: Configure Environment

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/duplicati

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/duplicati
```

## Step 4: Add Sample Data (Optional)

To test the dashboard with sample data, use MongoDB Compass or mongosh:

```javascript
// Connect to your database
use duplicati

// Insert sample backup data
db.backups.insertMany([
  {
    MachineName: "SERVER-01",
    BackupName: "Documents Backup",
    BackupId: "backup-001",
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
    ExaminedFiles: 15420,
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
  },
  {
    MachineName: "WORKSTATION-02",
    BackupName: "System Backup",
    BackupId: "backup-002",
    Status: "WARNING",
    ParsedResult: "Warning",
    PartialBackup: false,
    Interrupted: false,
    BeginTime: new Date("2024-01-15T09:00:00Z"),
    EndTime: new Date("2024-01-15T09:45:00Z"),
    RelativeEndTime: "1 hour ago",
    Duration: "00:45:00",
    MainOperation: "Backup",
    Version: "2.0.7.1",
    ExaminedFiles: 25600,
    OpenedFiles: 2400,
    AddedFiles: 120,
    ModifiedFiles: 56,
    DeletedFiles: 12,
    DeletedFolders: 3,
    AddedFolders: 5,
    FilesWithError: 2,
    NotProcessedFiles: 2,
    SizeOfExaminedFilesMB: 5120,
    SizeOfAddedFilesMB: 340,
    LastBackupDate: new Date("2024-01-15T09:45:00Z"),
    BackupListCount: 89,
    BytesDownloadedMB: 0,
    BytesUploadedMB: 340,
    FilesUploaded: 181,
    FilesDownloaded: 0,
    FilesDeleted: 12,
    RemoteCalls: 67,
    RetryAttempts: 3,
    FreeQuotaSpaceMB: 35000,
    TotalQuotaSpaceMB: 102400,
    UsedQuotaSpaceMB: 67400,
    QuotaUsagePercent: 65.8,
    WarningsCount: 2,
    ErrorsCount: 0,
    MessagesCount: 8,
    LogLines: ["Warning: 2 files could not be accessed"],
    HasErrors: false,
    ReceivedAt: new Date(),
    ExecutionMode: "Scheduled"
  },
  {
    MachineName: "DATABASE-SERVER",
    BackupName: "Database Backup",
    BackupId: "backup-003",
    Status: "ERROR",
    ParsedResult: "Error",
    PartialBackup: true,
    Interrupted: true,
    BeginTime: new Date("2024-01-15T02:00:00Z"),
    EndTime: new Date("2024-01-15T02:15:00Z"),
    RelativeEndTime: "8 hours ago",
    Duration: "00:15:00",
    MainOperation: "Backup",
    Version: "2.0.7.1",
    ExaminedFiles: 3200,
    OpenedFiles: 450,
    AddedFiles: 0,
    ModifiedFiles: 0,
    DeletedFiles: 0,
    DeletedFolders: 0,
    AddedFolders: 0,
    FilesWithError: 15,
    NotProcessedFiles: 2785,
    SizeOfExaminedFilesMB: 450,
    SizeOfAddedFilesMB: 0,
    LastBackupDate: new Date("2024-01-14T02:00:00Z"),
    BackupListCount: 120,
    BytesDownloadedMB: 0,
    BytesUploadedMB: 0,
    FilesUploaded: 0,
    FilesDownloaded: 0,
    FilesDeleted: 0,
    RemoteCalls: 8,
    RetryAttempts: 5,
    FreeQuotaSpaceMB: 25000,
    TotalQuotaSpaceMB: 51200,
    UsedQuotaSpaceMB: 26200,
    QuotaUsagePercent: 51.2,
    WarningsCount: 3,
    ErrorsCount: 12,
    MessagesCount: 18,
    LogLines: [
      "Error: Connection timeout to remote server",
      "Error: Failed to authenticate",
      "Error: Backup interrupted due to multiple failures"
    ],
    Exception: "System.Net.WebException: Unable to connect to remote server",
    HasErrors: true,
    ReceivedAt: new Date(),
    ExecutionMode: "Scheduled"
  }
])
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Dashboard

You should see:

1. **Dashboard Header** with total machine count and status summary
2. **Machine Cards** showing:
   - Color-coded server icons (Green/Yellow/Red)
   - Machine name and backup count
   - Health score
   - Last backup time
   - Backup size and files examined
   - Quota usage progress bar
   - Success rate
3. **Auto-refresh indicator** (updates every 15 seconds)
4. **Search bar** to filter machines

Click on any machine card to view:
- Detailed metrics
- Interactive charts (size trend, status distribution, files processed, duration)
- Backup history table with expandable rows
- Error details (if any errors exist)

## Step 7: Test Dark Mode

Click the moon/sun icon in the header to toggle dark mode.

## Troubleshooting

### Issue: "Failed to connect to MongoDB"

**Solution**:
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env.local`
- For MongoDB Atlas, ensure your IP is whitelisted

### Issue: "No machines found"

**Solution**:
- Add sample data (see Step 4)
- Check MongoDB collection name is `backups`
- Verify data format matches schema

### Issue: Page not loading

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Issue: TypeScript errors

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update dependencies
npm update
```

## Next Steps

1. **Connect Real Data**: Configure Duplicati to send backup reports to MongoDB
2. **Customize Styling**: Modify colors and theme in `tailwind.config.ts`
3. **Adjust Auto-Refresh**: Change interval in `src/components/providers.tsx`
4. **Add Notifications**: Enable sound alerts in browser settings
5. **Deploy**: Follow deployment guide in README.md

## Production Build

When ready to deploy:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review API endpoints documentation
- Check MongoDB connection and data structure
- Ensure all environment variables are set correctly

Happy monitoring! 🚀
