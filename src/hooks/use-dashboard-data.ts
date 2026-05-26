import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalStats, MachineStatus } from "@/types/backup";
import { fetchApi } from "@/lib/fetch-api";

export const DASHBOARD_REFRESH_INTERVAL_MS = 60000;

function fetchMachines(): Promise<MachineStatus[]> {
  return fetchApi<MachineStatus[]>("/api/machines");
}

export function useDashboardData(initialMachines?: MachineStatus[]) {
  const machinesQuery = useQuery({
    queryKey: ["machines"],
    queryFn: fetchMachines,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
    initialData: initialMachines,
  });

  const stats = useMemo<GlobalStats | undefined>(() => {
    const machines = machinesQuery.data;
    if (!machines || machines.length === 0) return undefined;

    let successfulMachines = 0;
    let warningMachines = 0;
    let errorMachines = 0;
    let totalBackups = 0;

    machines.forEach((machine) => {
      const status = machine.latestBackup?.Status;
      if (status === "SUCCESS") {
        successfulMachines++;
      } else if (status === "WARNING" || status === "PARTIAL") {
        warningMachines++;
      } else if (status === "ERROR") {
        errorMachines++;
      }
      totalBackups += machine.totalBackups || 0;
    });

    return {
      totalMachines: machines.length,
      successfulMachines,
      warningMachines,
      errorMachines,
      totalBackups,
      lastUpdated: new Date(),
    };
  }, [machinesQuery.data]);

  const refresh = useCallback(async () => {
    const machinesResult = await machinesQuery.refetch();
    if (machinesResult.error) throw machinesResult.error;
  }, [machinesQuery]);

  return {
    machines: machinesQuery.data ?? [],
    stats,
    machinesError: machinesQuery.error,
    statsError: machinesQuery.error,
    isInitialLoading: machinesQuery.isLoading,
    isRefreshing: machinesQuery.isFetching,
    refresh,
  };
}
