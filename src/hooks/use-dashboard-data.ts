import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalStats, MachineStatus } from "@/types/backup";

export const DASHBOARD_REFRESH_INTERVAL_MS = 60000;

async function fetchMachines(): Promise<MachineStatus[]> {
  const response = await fetch("/api/machines", { cache: "no-store" });
  if (!response.ok) throw new Error("Error al obtener máquinas");
  return response.json();
}

async function fetchStats(): Promise<GlobalStats> {
  const response = await fetch("/api/stats", { cache: "no-store" });
  if (!response.ok) throw new Error("Error al obtener estadísticas");
  return response.json();
}

export function useDashboardData() {
  const machinesQuery = useQuery({
    queryKey: ["machines"],
    queryFn: fetchMachines,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
  });

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
  });

  const refresh = useCallback(async () => {
    const [machinesResult, statsResult] = await Promise.all([
      machinesQuery.refetch(),
      statsQuery.refetch(),
    ]);

    if (machinesResult.error) throw machinesResult.error;
    if (statsResult.error) throw statsResult.error;
  }, [machinesQuery, statsQuery]);

  return {
    machines: machinesQuery.data ?? [],
    stats: statsQuery.data,
    machinesError: machinesQuery.error,
    statsError: statsQuery.error,
    isInitialLoading: machinesQuery.isLoading,
    isRefreshing: machinesQuery.isFetching || statsQuery.isFetching,
    refresh,
  };
}
