"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { MachineStatus, GlobalStats } from "@/types/backup";
import { MachineCard } from "@/components/machine-card";
import { DashboardStats } from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import { DashboardStatusFilter } from "@/lib/dashboard-filters";

interface DashboardMachineContentProps {
  machines: MachineStatus[];
  stats?: GlobalStats;
  isLoading: boolean;
  machinesError: Error | null;
  statsError: Error | null;
  searchTerm: string;
  statusFilter: DashboardStatusFilter;
  refreshIntervalMs: number;
  onStatusFilterChange: (filter: DashboardStatusFilter) => void;
  onRetry: () => void | Promise<void>;
}

function DashboardLoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function DashboardErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="text-lg font-semibold">No se pudieron cargar las máquinas</h3>
      <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
      <Button className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function DashboardEmptyState({
  searchTerm,
  showClearFilter,
  onClearFilter,
}: {
  searchTerm: string;
  showClearFilter: boolean;
  onClearFilter: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No se encontraron máquinas</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {searchTerm
          ? "Intenta ajustar tus términos de búsqueda"
          : "Esperando la llegada de reportes de respaldo"}
      </p>
      {showClearFilter && (
        <Button className="mt-4" variant="outline" onClick={onClearFilter}>
          Limpiar filtro
        </Button>
      )}
    </div>
  );
}

export function DashboardMachineContent({
  machines,
  stats,
  isLoading,
  machinesError,
  statsError,
  searchTerm,
  statusFilter,
  refreshIntervalMs,
  onStatusFilterChange,
  onRetry,
}: DashboardMachineContentProps) {
  const hasMachines = machines.length > 0;

  if (isLoading) return <DashboardLoadingState />;
  if (machinesError && !hasMachines)
    return (
      <DashboardErrorState errorMessage={machinesError.message} onRetry={onRetry} />
    );

  return (
    <>
      <div className="z-20 mb-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        <span>Actualizando cada {Math.floor(refreshIntervalMs / 1000)}s</span>
      </div>

      {statsError && (
        <p className="mb-3 text-xs text-muted-foreground">
          No se pudieron cargar las estadísticas globales en este momento.
        </p>
      )}

      <DashboardStats
        stats={stats}
        onFilterClick={onStatusFilterChange}
        activeFilter={statusFilter}
      />

      {!hasMachines ? (
        <DashboardEmptyState
          searchTerm={searchTerm}
          showClearFilter={statusFilter !== "all"}
          onClearFilter={() => onStatusFilterChange("all")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {machines.map((machine, index) => (
            <MachineCard key={machine.machineName} machine={machine} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
