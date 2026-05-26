import {
  EmailAccountQuota,
  EmailQuotaStatus,
  EmailStatusFilter,
} from "@/types/email";

function matchesStatusFilter(
  status: EmailQuotaStatus,
  filter: EmailStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "success") return status === "SUCCESS";
  if (filter === "warning") return status === "WARNING";
  return status === "ERROR";
}

export function filterEmailAccounts(
  accounts: EmailAccountQuota[],
  searchTerm: string,
  filter: EmailStatusFilter,
): EmailAccountQuota[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return accounts.filter((account) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      account.email.toLowerCase().includes(normalizedSearch);

    return matchesSearch && matchesStatusFilter(account.status, filter);
  });
}
