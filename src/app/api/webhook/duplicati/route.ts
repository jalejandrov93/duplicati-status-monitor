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
      PartialBackup: data.PartialBackup === "true" || data.PartialBackup === true,
      Interrupted: data.Interrupted === "true" || data.Interrupted === true,
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

    console.log(`Backup report received for ${backupDocument.MachineName} - Status: ${backupDocument.Status}`);

    return NextResponse.json(
      { success: true, message: "Backup report received", machineName: backupDocument.MachineName },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function mapStatus(parsedResult: string): "SUCCESS" | "WARNING" | "PARTIAL" | "ERROR" {
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
  if (typeof logLines === "string") return logLines.split("\n").filter(line => line.trim());
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
