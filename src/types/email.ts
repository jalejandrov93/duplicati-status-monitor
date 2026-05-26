export type EmailQuotaStatus = "SUCCESS" | "WARNING" | "ERROR";

export interface EmailAccountQuota {
  email: string;
  usagePercent: number | null;
  usedBytes: number;
  quotaBytes: number | null;
  status: EmailQuotaStatus;
  isUnlimited: boolean;
}

export interface EmailStats {
  totalAccounts: number;
  successAccounts: number;
  warningAccounts: number;
  errorAccounts: number;
}

export interface EmailDashboardResponse {
  accounts: EmailAccountQuota[];
  stats: EmailStats;
  lastUpdated: string;
}

export type EmailStatusFilter = "all" | "success" | "warning" | "error";
