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
