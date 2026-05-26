import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailDashboardResponse } from "@/types/email";
import { fetchApi } from "@/lib/fetch-api";

export const EMAIL_DASHBOARD_REFRESH_INTERVAL_MS = 60000;

function fetchEmailDashboard(): Promise<EmailDashboardResponse> {
  return fetchApi<EmailDashboardResponse>("/api/emails");
}

export function useEmailDashboardData() {
  const query = useQuery({
    queryKey: ["email-dashboard"],
    queryFn: fetchEmailDashboard,
    refetchInterval: EMAIL_DASHBOARD_REFRESH_INTERVAL_MS,
  });

  const refresh = useCallback(async () => {
    const result = await query.refetch();
    if (result.error) throw result.error;
  }, [query]);

  return {
    accounts: query.data?.accounts ?? [],
    stats: query.data?.stats,
    lastUpdated: query.data?.lastUpdated,
    error: query.error,
    isInitialLoading: query.isLoading,
    isRefreshing: query.isFetching,
    refresh,
  };
}
