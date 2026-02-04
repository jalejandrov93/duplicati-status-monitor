import mongoose, { Schema, Model } from "mongoose";
import { BackupDocument } from "@/types/backup";

const BackupSchema = new Schema<BackupDocument>(
  {
    MachineName: { type: String, required: true, index: true },
    BackupName: { type: String, required: true },
    BackupId: { type: String, required: true },
    Status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "WARNING", "PARTIAL", "ERROR"],
      index: true
    },
    ParsedResult: { type: String, required: true },
    PartialBackup: { type: Boolean, default: false },
    Interrupted: { type: Boolean, default: false },
    BeginTime: { type: Date, required: true },
    EndTime: { type: Date, required: true, index: true },
    RelativeEndTime: { type: String, required: true },
    Duration: { type: String, required: true },
    MainOperation: { type: String, required: true },
    Version: { type: String, required: true },
    ExaminedFiles: { type: Number, default: 0 },
    OpenedFiles: { type: Number, default: 0 },
    AddedFiles: { type: Number, default: 0 },
    ModifiedFiles: { type: Number, default: 0 },
    DeletedFiles: { type: Number, default: 0 },
    DeletedFolders: { type: Number, default: 0 },
    AddedFolders: { type: Number, default: 0 },
    FilesWithError: { type: Number, default: 0 },
    NotProcessedFiles: { type: Number, default: 0 },
    SizeOfExaminedFilesMB: { type: Number, default: 0 },
    SizeOfAddedFilesMB: { type: Number, default: 0 },
    LastBackupDate: { type: Date },
    BackupListCount: { type: Number, default: 0 },
    BytesDownloadedMB: { type: Number, default: 0 },
    BytesUploadedMB: { type: Number, default: 0 },
    FilesUploaded: { type: Number, default: 0 },
    FilesDownloaded: { type: Number, default: 0 },
    FilesDeleted: { type: Number, default: 0 },
    RemoteCalls: { type: Number, default: 0 },
    RetryAttempts: { type: Number, default: 0 },
    FreeQuotaSpaceMB: { type: Number, default: 0 },
    TotalQuotaSpaceMB: { type: Number, default: 0 },
    UsedQuotaSpaceMB: { type: Number, default: 0 },
    QuotaUsagePercent: { type: Number, default: 0 },
    WarningsCount: { type: Number, default: 0 },
    ErrorsCount: { type: Number, default: 0 },
    MessagesCount: { type: Number, default: 0 },
    LogLines: [{ type: String }],
    Exception: { type: String },
    HasErrors: { type: Boolean, default: false },
    AdditionalOperations: [{
      operation: String,
      result: String,
      details: Schema.Types.Mixed
    }],
    ReceivedAt: { type: Date, default: Date.now, index: true },
    WebhookUrl: { type: String },
    ExecutionMode: { type: String, required: true },
  },
  {
    collection: "duplicati",
    timestamps: true,
  }
);

// Create compound indexes for efficient queries
BackupSchema.index({ MachineName: 1, EndTime: -1 });
BackupSchema.index({ MachineName: 1, Status: 1 });

const Backup: Model<BackupDocument> =
  mongoose.models.Backup || mongoose.model<BackupDocument>("Backup", BackupSchema);

export default Backup;
