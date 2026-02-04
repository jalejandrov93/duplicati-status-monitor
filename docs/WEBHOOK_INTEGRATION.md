# Duplicati Webhook Integration Guide

This guide explains how to configure Duplicati to send backup reports directly to your monitoring dashboard.

## Overview

Duplicati can send HTTP POST requests (webhooks) containing backup report data to your dashboard. This allows real-time monitoring of backup jobs as they complete.

## Prerequisites

- Duplicati 2.0.7.1 or later
- Your monitoring dashboard running and accessible
- Network connectivity from Duplicati to your dashboard

## Method 1: Using Duplicati's Built-in Webhook (Recommended)

### Step 1: Create Webhook Receiver Endpoint

Add this file to your Next.js project:

**File**: `src/app/api/webhook/duplicati/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Backup from "@/models/Backup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    await connectDB();

    // Transform Duplicati webhook data to our schema
    const backupDocument = {
      MachineName: data.MachineName || data.MACHINE_NAME || "Unknown",
      BackupName: data.BackupName || data.backup_name || "Unknown",
      BackupId: data.BackupID || data.backup_id || generateId(),
      Status: mapStatus(data.ParsedResult || data.Result),
      ParsedResult: data.ParsedResult || data.Result || "Unknown",
      PartialBackup: data.PartialBackup || false,
      Interrupted: data.Interrupted || false,
      BeginTime: new Date(data.BeginTime || Date.now()),
      EndTime: new Date(data.EndTime || Date.now()),
      RelativeEndTime: getRelativeTime(data.EndTime),
      Duration: data.Duration || "00:00:00",
      MainOperation: data.MainOperation || "Backup",
      Version: data.Version || "Unknown",
      ExaminedFiles: parseInt(data.ExaminedFiles || "0"),
      OpenedFiles: parseInt(data.OpenedFiles || "0"),
      AddedFiles: parseInt(data.AddedFiles || "0"),
      ModifiedFiles: parseInt(data.ModifiedFiles || "0"),
      DeletedFiles: parseInt(data.DeletedFiles || "0"),
      DeletedFolders: parseInt(data.DeletedFolders || "0"),
      AddedFolders: parseInt(data.AddedFolders || "0"),
      FilesWithError: parseInt(data.FilesWithError || "0"),
      NotProcessedFiles: parseInt(data.NotProcessedFiles || "0"),
      SizeOfExaminedFilesMB: parseFloat(data.SizeOfExaminedFiles || "0") / (1024 * 1024),
      SizeOfAddedFilesMB: parseFloat(data.SizeOfAddedFiles || "0") / (1024 * 1024),
      LastBackupDate: data.LastBackupDate ? new Date(data.LastBackupDate) : new Date(),
      BackupListCount: parseInt(data.BackupListCount || "0"),
      BytesDownloadedMB: parseFloat(data.BytesDownloaded || "0") / (1024 * 1024),
      BytesUploadedMB: parseFloat(data.BytesUploaded || "0") / (1024 * 1024),
      FilesUploaded: parseInt(data.FilesUploaded || "0"),
      FilesDownloaded: parseInt(data.FilesDownloaded || "0"),
      FilesDeleted: parseInt(data.FilesDeleted || "0"),
      RemoteCalls: parseInt(data.RemoteCalls || "0"),
      RetryAttempts: parseInt(data.RetryAttempts || "0"),
      FreeQuotaSpaceMB: parseFloat(data.FreeQuotaSpace || "0") / (1024 * 1024),
      TotalQuotaSpaceMB: parseFloat(data.TotalQuotaSpace || "0") / (1024 * 1024),
      UsedQuotaSpaceMB: parseFloat(data.UsedQuotaSpace || "0") / (1024 * 1024),
      QuotaUsagePercent: calculateQuotaPercent(data.UsedQuotaSpace, data.TotalQuotaSpace),
      WarningsCount: parseInt(data.Warnings || "0"),
      ErrorsCount: parseInt(data.Errors || "0"),
      MessagesCount: parseInt(data.Messages || "0"),
      LogLines: parseLogLines(data.LogLines),
      Exception: data.Exception,
      HasErrors: (parseInt(data.Errors || "0") > 0) || data.Failed === "true",
      AdditionalOperations: parseAdditionalOperations(data),
      ReceivedAt: new Date(),
      WebhookUrl: request.url,
      ExecutionMode: data.ExecutionMode || "Unknown",
    };

    await Backup.create(backupDocument);

    return NextResponse.json(
      { success: true, message: "Backup report received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

function mapStatus(parsedResult: string): string {
  const result = (parsedResult || "").toLowerCase();
  if (result.includes("success")) return "SUCCESS";
  if (result.includes("warning")) return "WARNING";
  if (result.includes("partial")) return "PARTIAL";
  if (result.includes("error") || result.includes("fail")) return "ERROR";
  return "ERROR";
}

function getRelativeTime(endTime: string): string {
  if (!endTime) return "Unknown";
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = now.getTime() - end.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function calculateQuotaPercent(used: string, total: string): number {
  const usedNum = parseFloat(used || "0");
  const totalNum = parseFloat(total || "0");
  if (totalNum === 0) return 0;
  return (usedNum / totalNum) * 100;
}

function parseLogLines(logLines: any): string[] {
  if (Array.isArray(logLines)) return logLines;
  if (typeof logLines === "string") return logLines.split("\n");
  return [];
}

function parseAdditionalOperations(data: any): any[] {
  const operations = [];
  if (data.CompactResults) {
    operations.push({
      operation: "Compact",
      result: data.CompactResults,
      details: data.CompactDetails
    });
  }
  if (data.DeleteResults) {
    operations.push({
      operation: "Delete",
      result: data.DeleteResults,
      details: data.DeleteDetails
    });
  }
  if (data.TestResults) {
    operations.push({
      operation: "Test",
      result: data.TestResults,
      details: data.TestDetails
    });
  }
  return operations;
}

function generateId(): string {
  return `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Step 2: Configure Duplicati

1. Open Duplicati web interface
2. Edit your backup job
3. Go to **Options** tab
4. Add these advanced options:

**send-http-url**:
```
http://your-dashboard-url:3000/api/webhook/duplicati
```

**send-http-message**:
```json
{
  "MachineName": "%MACHINE_NAME%",
  "BackupName": "%backup-name%",
  "BackupID": "%backup-id%",
  "ParsedResult": "%PARSED_RESULT%",
  "PartialBackup": "%PARTIAL_BACKUP%",
  "Interrupted": "%INTERRUPTED%",
  "BeginTime": "%BEGINTIME%",
  "EndTime": "%ENDTIME%",
  "Duration": "%DURATION%",
  "MainOperation": "%MAIN_OPERATION%",
  "Version": "%VERSION%",
  "ExaminedFiles": "%ExaminedFiles%",
  "OpenedFiles": "%OpenedFiles%",
  "AddedFiles": "%AddedFiles%",
  "ModifiedFiles": "%ModifiedFiles%",
  "DeletedFiles": "%DeletedFiles%",
  "DeletedFolders": "%DeletedFolders%",
  "AddedFolders": "%AddedFolders%",
  "FilesWithError": "%FilesWithError%",
  "NotProcessedFiles": "%NotProcessedFiles%",
  "SizeOfExaminedFiles": "%SizeOfExaminedFiles%",
  "SizeOfAddedFiles": "%SizeOfAddedFiles%",
  "LastBackupDate": "%LAST_BACKUP_DATE%",
  "BackupListCount": "%BACKUP_LIST_COUNT%",
  "BytesUploaded": "%BytesUploaded%",
  "BytesDownloaded": "%BytesDownloaded%",
  "FilesUploaded": "%FilesUploaded%",
  "FilesDownloaded": "%FilesDownloaded%",
  "FilesDeleted": "%FilesDeleted%",
  "RemoteCalls": "%RemoteCalls%",
  "RetryAttempts": "%RetryAttempts%",
  "TotalQuotaSpace": "%TotalQuotaSpace%",
  "FreeQuotaSpace": "%FreeQuotaSpace%",
  "UsedQuotaSpace": "%AssignedQuotaSpace%",
  "Warnings": "%Warnings%",
  "Errors": "%Errors%",
  "Messages": "%Messages%",
  "LogLines": "%LogLines%",
  "Exception": "%Exception%",
  "ExecutionMode": "Scheduled"
}
```

**send-http-result-output-format**: `Json`

**send-http-level**: `All` (or `Success,Warning,Error` based on preference)

**send-http-verb**: `POST`

## Method 2: Using run-script-after (Alternative)

If webhooks aren't available, use a script:

### Windows (PowerShell)

**File**: `send-to-dashboard.ps1`

```powershell
param(
    [string]$OPERATIONNAME,
    [string]$REMOTEURL,
    [string]$LOCALPATH,
    [string]$PARSEDRESULT
)

$webhookUrl = "http://your-dashboard:3000/api/webhook/duplicati"

$data = @{
    MachineName = $env:COMPUTERNAME
    BackupName = $OPERATIONNAME
    ParsedResult = $PARSEDRESULT
    EndTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    # Add more fields as needed
} | ConvertTo-Json

Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $data -ContentType "application/json"
```

In Duplicati options:
- **run-script-after**: `powershell.exe -File C:\path\to\send-to-dashboard.ps1`

### Linux/macOS (Bash)

**File**: `send-to-dashboard.sh`

```bash
#!/bin/bash

WEBHOOK_URL="http://your-dashboard:3000/api/webhook/duplicati"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"MachineName\": \"$(hostname)\",
    \"BackupName\": \"$DUPLICATI__OPERATIONNAME\",
    \"ParsedResult\": \"$DUPLICATI__PARSED_RESULT\",
    \"EndTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"
```

In Duplicati options:
- **run-script-after**: `/path/to/send-to-dashboard.sh`

## Testing the Integration

### Test with curl

```bash
curl -X POST http://localhost:3000/api/webhook/duplicati \
  -H "Content-Type: application/json" \
  -d '{
    "MachineName": "TEST-SERVER",
    "BackupName": "Test Backup",
    "ParsedResult": "Success",
    "EndTime": "2024-01-15T10:30:00Z",
    "ExaminedFiles": "1000",
    "SizeOfExaminedFiles": "1073741824"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Backup report received"
}
```

### Verify in Dashboard

1. Open dashboard: `http://localhost:3000`
2. Look for "TEST-SERVER" in the machines list
3. Click on the card to view details

## Security Considerations

### 1. Enable Authentication

Add API key authentication to webhook endpoint:

```typescript
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Process webhook...
}
```

In Duplicati, add header:
- **send-http-extra-headers**: `X-API-Key: your-secret-key`

### 2. Use HTTPS

Always use HTTPS in production:
```
https://dashboard.example.com/api/webhook/duplicati
```

### 3. IP Whitelisting

Restrict access to known IPs in your hosting provider or reverse proxy.

### 4. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // Process webhook...
}
```

## Troubleshooting

### Webhook not received

1. **Check network connectivity**:
   ```bash
   curl http://your-dashboard:3000/api/webhook/duplicati
   ```

2. **Verify Duplicati logs**:
   - Check `About > Show log > Live`
   - Look for HTTP-related errors

3. **Test webhook endpoint**:
   ```bash
   curl -v -X POST http://localhost:3000/api/webhook/duplicati \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Invalid data format

- Check MongoDB logs for validation errors
- Verify JSON format in `send-http-message`
- Test with sample payload using curl

### Performance issues

- Ensure MongoDB has proper indexes
- Use `force-dynamic` in route handlers
- Consider queue system for high volume

## Advanced: Batch Processing

For multiple backups, consider batching:

```typescript
// Queue system with BullMQ or similar
import { Queue } from 'bullmq';

const backupQueue = new Queue('backups', {
  connection: Redis.fromEnv()
});

export async function POST(request: NextRequest) {
  const data = await request.json();

  await backupQueue.add('process-backup', data);

  return NextResponse.json({ success: true });
}
```

## Support

If you encounter issues:
1. Check Duplicati forum: https://forum.duplicati.com
2. Review Next.js API routes docs
3. Check MongoDB connection and permissions
4. Verify network firewall settings

Happy monitoring! 🎯
