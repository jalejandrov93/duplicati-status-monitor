import { DnsHealthResult } from "@/lib/email/dns-health";

export type EmailQuotaStatus = "SUCCESS" | "WARNING" | "ERROR";

export interface EmailAccountQuota {
  email: string;
  usagePercent: number | null;
  usedBytes: number;
  quotaBytes: number | null;
  status: EmailQuotaStatus;
  isUnlimited: boolean;
  suspendedLogin: boolean;
  suspendedIncoming: boolean;
  suspendedOutgoing: boolean;
  healthScore?: number;
  healthStatus?: "excellent" | "good" | "warning" | "critical";
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
  domainDnsHealth?: DnsHealthResult;
}

export type EmailStatusFilter = "all" | "success" | "warning" | "error";
