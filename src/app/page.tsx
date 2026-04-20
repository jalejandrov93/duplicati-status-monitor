"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardMachineContent } from "@/components/dashboard-machine-content";
import { DashboardStatusFilter, filterMachines } from "@/lib/dashboard-filters";
import {
  DASHBOARD_REFRESH_INTERVAL_MS,
  useDashboardData,
} from "@/hooks/use-dashboard-data";
import { useMachineAlerts } from "@/hooks/use-machine-alerts";
import { toast } from "sonner";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>("all");
  const {
    machines,
    stats,
    machinesError,
    statsError,
    isInitialLoading,
    isRefreshing,
    refresh,
  } = useDashboardData();

  useMachineAlerts(machines);

  const filteredMachines = useMemo(
    () => filterMachines(machines, searchTerm, statusFilter),
    [machines, searchTerm, statusFilter],
  );

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success("Panel actualizado");
    } catch {
      toast.error("No se pudo actualizar el panel");
    }
  };

  return (
    <div className="min-h-screen">
      <BackgroundRippleEffect cols={30} rows={15} />
      <DashboardHeader
        stats={stats}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="container mx-auto px-4 py-4">
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
      <footer className="fixed bottom-0 left-0 px-4 py-4">
        <Logo />
      </footer>
    </div>
  );
}
