import { EmailAccountQuota, EmailStats } from "@/types/email";

export function buildEmailStats(accounts: EmailAccountQuota[]): EmailStats {
  return {
    totalAccounts: accounts.length,
    successAccounts: accounts.filter((account) => account.status === "SUCCESS")
      .length,
    warningAccounts: accounts.filter((account) => account.status === "WARNING")
      .length,
    errorAccounts: accounts.filter((account) => account.status === "ERROR")
      .length,
  };
}
