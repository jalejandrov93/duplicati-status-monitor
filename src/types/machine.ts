export interface MachineDetailData {
    machineName: string;
    latestBackup: LatestBackup;
    totalBackups: number;
    successRate: number;
    averageSize: number;
    lastSuccessfulBackup?: string;
    currentQuotaUsage: number;
    healthScore: number;
    statusDistribution: StatusDistribution;
    recentBackups: BackupRecord[];
    totalFilesProcessed: number;
}

export interface StatusDistribution {
    success: number;
    warning: number;
    error: number;
    partial: number;
}

export interface LatestBackup {
    Status: BackupStatus;
    RelativeEndTime?: string;
    HasErrors?: boolean;
    Exception?: string;
    LogLines?: string[];
    ErrorsCount?: number;
    RetryAttempts?: number;
    UsedQuotaSpaceMB?: number;
    TotalQuotaSpaceMB?: number;
}

export interface BackupRecord {
    EndTime: string;
    Status: BackupStatus;
    Duration: string;
    SizeOfExaminedFilesMB: number;
    ExaminedFiles: number;
    AddedFiles: number;
}

export type BackupStatus = "SUCCESS" | "WARNING" | "ERROR" | "PARTIAL";

export type StatusBadgeVariant = "success" | "warning" | "error" | "default";

export type DuplicatiErrorType =
    | "MISSING_FILES"
    | "CORRUPTED_FILES"
    | "PERMISSION_DENIED"
    | "ENCRYPTION_ERROR"
    | "TIMEOUT"
    | "CONNECTION_ERROR"
    | "DISK_FULL"
    | "DATABASE_CORRUPT"
    | "UNKNOWN";

export interface ParsedErrorInfo {
    errorType: DuplicatiErrorType;
    errorTitle: string;
    errorDescription: string;
    suggestedCommand: string;
    suggestedAction: string;
    isRepairable: boolean;
    missingFiles?: string[];
    warningCount?: number;
}
