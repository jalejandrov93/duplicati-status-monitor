"use client";

import { use, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BackupHistoryTable } from "@/components/backup-history-table";
import { BackupCharts } from "@/components/backup-charts";
import {
  MachineMetricCard,
  MachineQuotaCard,
  MachineErrorDetails,
  MachineDetailHeader,
} from "@/components/machine-detail";
import { HardDrive, CheckCircle2, Activity, AlertCircle } from "lucide-react";
import { formatBytes, getHealthScoreColor } from "@/lib/utils";
import { useMachineDetails } from "@/hooks/use-machine-details";
import MachineLoader from "@/components/machine-loader";
import type { StatusBadgeVariant } from "@/types/machine";

export default function MachineDetailPage({
  params,
}: {
  params: Promise<{ machineName: string }>;
}) {
  const resolvedParams = use(params);
  const machineName = decodeURIComponent(resolvedParams.machineName);

  const { data, isLoading } = useMachineDetails(machineName);

  const healthColors = useMemo(() => {
    if (!data) return { color: "#6b7280", label: "N/A" };
    return getHealthScoreColor(data.healthScore);
  }, [data]);

  const statusBadgeVariant = useMemo((): StatusBadgeVariant => {
    if (!data) return "default";
    const status = data.latestBackup.Status;
    if (status === "SUCCESS") return "success";
    if (status === "WARNING") return "warning";
    if (status === "ERROR") return "error";
    return "default";
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <MachineLoader />
          <p className="text-muted-foreground">
            Cargando detalles de la máquina...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Máquina no encontrada</h2>
          <Button onClick={() => window.history.back()}>Volver al Panel</Button>
        </div>
      </div>
    );
  }

  const healthScore = !isNaN(data.healthScore) ? data.healthScore : 0;
  const totalBackups = !isNaN(data.totalBackups) ? data.totalBackups : 0;
  const successRate = !isNaN(data.successRate)
    ? data.successRate.toFixed(1)
    : "0.0";
  const averageSize = !isNaN(data.averageSize) ? data.averageSize : 0;
  const showQuota = data.currentQuotaUsage != null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MachineDetailHeader
        machineName={data.machineName}
        status={data.latestBackup.Status}
        relativeEndTime={data.latestBackup.RelativeEndTime}
        statusBadgeVariant={statusBadgeVariant}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 mb-8 ${showQuota ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
        >
          <MachineMetricCard
            title="Puntuación de Salud"
            icon={
              <Activity
                className="w-8 h-8"
                style={{ color: healthColors.color }}
              />
            }
            value={healthScore}
            subtitle={healthColors.label}
            index={0}
          />

          <MachineMetricCard
            title="Respaldos Totales"
            icon={<HardDrive className="w-8 h-8 text-blue-500" />}
            value={totalBackups}
            subtitle={`${formatBytes(averageSize * 1024 * 1024)} prom`}
            index={1}
          />

          <MachineMetricCard
            title="Tasa de Éxito"
            icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
            value={`${successRate}%`}
            subtitle={`${data.statusDistribution.success} de ${totalBackups}`}
            index={2}
          />

          {showQuota && (
            <MachineQuotaCard
              currentQuotaUsage={data.currentQuotaUsage}
              usedQuotaSpace={data.latestBackup.UsedQuotaSpaceMB ?? 0}
              totalQuotaSpace={data.latestBackup.TotalQuotaSpaceMB ?? 0}
              index={3}
            />
          )}
        </div>

        {/* Charts */}
        <BackupCharts
          recentBackups={data.recentBackups}
          statusDistribution={data.statusDistribution}
        />

        {/* Latest Backup Details */}
        <MachineErrorDetails latestBackup={data.latestBackup} />

        {/* Backup History */}
        <BackupHistoryTable machineName={machineName} />
      </main>
    </div>
  );
}
