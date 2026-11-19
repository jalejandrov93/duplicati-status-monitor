import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailDashboardResponse } from "@/types/email";
import { fetchApi } from "@/lib/fetch-api";

// The email dashboard hits cPanel and several DNS/DNSBL endpoints, so it is
// polled sparingly to avoid tripping the provider's firewall / cPHulk.
export const EMAIL_DASHBOARD_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function fetchEmailDashboard(): Promise<EmailDashboardResponse> {
  return fetchApi<EmailDashboardResponse>("/api/emails");
}

export function useEmailDashboardData({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: ["email-dashboard"],
    queryFn: fetchEmailDashboard,
    enabled,
    refetchInterval: EMAIL_DASHBOARD_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    // One fetch when entering the module; afterwards only the interval or the
    // manual refresh button trigger requests.
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Retrying failed requests multiplies hits against the mail server.
    retry: false,
  });

  const refresh = useCallback(async () => {
    const result = await query.refetch();
    if (result.error) throw result.error;
  }, [query]);

  return {
    accounts: query.data?.accounts ?? [],
    stats: query.data?.stats,
    lastUpdated: query.data?.lastUpdated,
    domainDnsHealth: query.data?.domainDnsHealth,
    error: query.error,
    isInitialLoading: query.isLoading,
    isRefreshing: query.isFetching,
    refresh,
  };
}
