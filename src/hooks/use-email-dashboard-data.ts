import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailDashboardResponse } from "@/types/email";

export const EMAIL_DASHBOARD_REFRESH_INTERVAL_MS = 60000;

async function fetchEmailDashboard(): Promise<EmailDashboardResponse> {
  const response = await fetch("/api/emails", { cache: "no-store" });
  if (response.status === 403) {
    throw new Error("No autorizado para acceder al módulo de correos");
  }
  if (response.status === 503) {
    throw new Error("El servicio de correos no está configurado");
  }
  if (!response.ok) {
    throw new Error("Error al obtener cuotas de correo");
  }
  return response.json();
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
