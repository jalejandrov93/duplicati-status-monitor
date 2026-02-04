export type BackupStatus = "SUCCESS" | "WARNING" | "PARTIAL" | "ERROR";

export interface BackupDocument {
  _id?: string;
  MachineName: string;
  BackupName: string;
  BackupId: string;
  Status: BackupStatus;
  ParsedResult: string;
  PartialBackup: boolean;
  Interrupted: boolean;
  BeginTime: Date;
  EndTime: Date;
  RelativeEndTime: string;
  Duration: string;
  MainOperation: string;
  Version: string;
  ExaminedFiles: number;
  OpenedFiles: number;
  AddedFiles: number;
  ModifiedFiles: number;
  DeletedFiles: number;
  DeletedFolders: number;
  AddedFolders: number;
  FilesWithError: number;
  NotProcessedFiles: number;
  SizeOfExaminedFilesMB: number;
  SizeOfAddedFilesMB: number;
  LastBackupDate: Date;
  BackupListCount: number;
  BytesDownloadedMB: number;
  BytesUploadedMB: number;
  FilesUploaded: number;
  FilesDownloaded: number;
  FilesDeleted: number;
  RemoteCalls: number;
  RetryAttempts: number;
  FreeQuotaSpaceMB: number;
  TotalQuotaSpaceMB: number;
  UsedQuotaSpaceMB: number;
  QuotaUsagePercent: number;
  WarningsCount: number;
  ErrorsCount: number;
  MessagesCount: number;
  LogLines?: string[];
  Exception?: string;
  HasErrors: boolean;
  AdditionalOperations?: {
    operation: string;
    result: string;
    details?: any;
  }[];
  ReceivedAt: Date;
  WebhookUrl?: string;
  ExecutionMode: string;
}

export interface MachineStatus {
  machineName: string;
  latestBackup: BackupDocument;
  totalBackups: number;
  successRate: number;
  averageSize: number;
  lastSuccessfulBackup?: Date;
  currentQuotaUsage: number;
  healthScore: number;
}

export interface GlobalStats {
  totalMachines: number;
  successfulMachines: number;
  warningMachines: number;
  errorMachines: number;
  totalBackups: number;
  lastUpdated: Date;
}

export interface BackupHistoryParams {
  machineName: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  status?: BackupStatus;
}

export interface BackupHistoryResponse {
  backups: BackupDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
