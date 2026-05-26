import { fetchCpanelEmailAccounts } from "@/lib/email/cpanel-client";
import { resolveCpanelDiskBytes } from "@/lib/email/cpanel-disk-units";
import { buildEmailStats } from "@/lib/email/email-stats";
import {
  EmailAccountQuota,
  EmailDashboardResponse,
  EmailQuotaStatus,
  EmailStats,
} from "@/types/email";

function getWarningThreshold(): number {
  const raw = process.env.EMAIL_QUOTA_WARNING_PERCENT;
  const value = raw ? Number.parseFloat(raw) : 70;
  return Number.isFinite(value) ? value : 70;
}

function getCriticalThreshold(): number {
  const raw = process.env.EMAIL_QUOTA_CRITICAL_PERCENT;
  const value = raw ? Number.parseFloat(raw) : 90;
  return Number.isFinite(value) ? value : 90;
}

function isUnlimitedValue(value: number | string | undefined): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "unlimited" || normalized === "none" || normalized === ""
    );
  }
  return false;
}

function toNumber(value: number | string | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function resolveStatus(
  usagePercent: number | null,
  isUnlimited: boolean,
): EmailQuotaStatus {
  if (isUnlimited || usagePercent === null) return "SUCCESS";

  const warning = getWarningThreshold();
  const critical = getCriticalThreshold();

  if (usagePercent >= critical) return "ERROR";
  if (usagePercent >= warning) return "WARNING";
  return "SUCCESS";
}

function mapAccount(raw: {
  email?: string;
  login?: string;
  diskused?: number | string;
  diskquota?: number | string;
  diskusedpercent?: number | string;
  humandiskused?: string;
  humandiskquota?: string;
}): EmailAccountQuota | null {
  const email = raw.email || raw.login;
  if (!email) return null;

  const isUnlimited = isUnlimitedValue(raw.diskquota);
  const usedBytes = resolveCpanelDiskBytes(
    toNumber(raw.diskused),
    raw.humandiskused,
  );
  const quotaBytes = isUnlimited
    ? null
    : resolveCpanelDiskBytes(toNumber(raw.diskquota), raw.humandiskquota);

  let usagePercent: number | null = null;
  if (!isUnlimited && quotaBytes && quotaBytes > 0) {
    const fromApi = toNumber(raw.diskusedpercent);
    usagePercent =
      fromApi > 0 ? fromApi : Math.min(100, (usedBytes / quotaBytes) * 100);
  }

  return {
    email,
    usagePercent,
    usedBytes,
    quotaBytes,
    isUnlimited,
    status: resolveStatus(usagePercent, isUnlimited),
  };
}

function buildStats(accounts: EmailAccountQuota[]): EmailStats {
  return buildEmailStats(accounts);
}

export async function getEmailDashboardData(): Promise<EmailDashboardResponse> {
  const rawAccounts = await fetchCpanelEmailAccounts();
  const accounts = rawAccounts
    .map(mapAccount)
    .filter((account): account is EmailAccountQuota => account !== null)
    .sort((a, b) => {
      const percentA = a.usagePercent ?? -1;
      const percentB = b.usagePercent ?? -1;
      return percentB - percentA;
    });

  return {
    accounts,
    stats: buildStats(accounts),
    lastUpdated: new Date().toISOString(),
  };
}
