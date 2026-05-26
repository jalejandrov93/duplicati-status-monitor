"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DashboardMachineContent } from "@/components/dashboard-machine-content";
import { useMonitorToolbar } from "@/components/monitor/monitor-toolbar-context";
import { DashboardStatusFilter, filterMachines } from "@/lib/dashboard-filters";
import {
  DASHBOARD_REFRESH_INTERVAL_MS,
  useDashboardData,
} from "@/hooks/use-dashboard-data";
import { useMachineAlerts } from "@/hooks/use-machine-alerts";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { MachineStatus } from "@/types/backup";

interface DashboardClientProps {
  initialMachines: MachineStatus[];
}

export default function DashboardClient({ initialMachines }: DashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DashboardStatusFilter>("all");
  const {
    machines,
    stats,
    machinesError,
    statsError,
    isInitialLoading,
    isRefreshing,
    refresh,
  } = useDashboardData(initialMachines);

  useMachineAlerts(machines);

  const filteredMachines = useMemo(
    () => filterMachines(machines, searchTerm, statusFilter),
    [machines, searchTerm, statusFilter],
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      toast.success("Panel actualizado");
    } catch {
      toast.error("No se pudo actualizar el panel");
    }
  }, [refresh]);

  const meta = stats
    ? `Actualizado: ${format(new Date(stats.lastUpdated), "HH:mm:ss")}`
    : undefined;

  useMonitorToolbar({
    searchPlaceholder: "Buscar...",
    searchTerm,
    onSearchChange: setSearchTerm,
    isRefreshing,
    onRefresh: handleRefresh,
    meta,
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <BackgroundRippleEffect cols={30} rows={15} />
      <main className="container relative mx-auto flex-1 px-4 py-4">
        <DashboardMachineContent
          machines={filteredMachines}
          stats={stats}
          isLoading={isInitialLoading}
          machinesError={machinesError instanceof Error ? machinesError : null}
          statsError={statsError instanceof Error ? statsError : null}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          refreshIntervalMs={DASHBOARD_REFRESH_INTERVAL_MS}
          onStatusFilterChange={setStatusFilter}
          onRetry={handleRefresh}
        />
      </main>
    </div>
  );
}
