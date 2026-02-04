"use client";

import { use, useMemo, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackupHistoryTable } from "@/components/backup-history-table";
import { BackupCharts } from "@/components/backup-charts";
import {
  ArrowLeft,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import { getStatusColor, formatBytes, getHealthScoreColor } from "@/lib/utils";
import { motion } from "framer-motion";

interface MachineDetailData {
  machineName: string;
  latestBackup: any;
  totalBackups: number;
  successRate: number;
  averageSize: number;
  lastSuccessfulBackup?: string;
  currentQuotaUsage: number;
  healthScore: number;
  statusDistribution: {
    success: number;
    warning: number;
    error: number;
    partial: number;
  };
  recentBackups: any[];
  totalFilesProcessed: number;
}

async function fetchMachineDetails(
  machineName: string,
): Promise<MachineDetailData> {
  const res = await fetch(`/api/machines/${encodeURIComponent(machineName)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener detalles de la máquina");
  return res.json();
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

const MetricCard = memo(function MetricCard({
  title,
  icon,
  value,
  subtitle,
  index,
}: {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  subtitle?: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <div className="text-3xl font-bold">{value}</div>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const QuotaCard = memo(function QuotaCard({
  currentQuotaUsage,
  usedQuotaSpace,
  totalQuotaSpace,
  index,
}: {
  currentQuotaUsage: number;
  usedQuotaSpace: number;
  totalQuotaSpace: number;
  index: number;
}) {
  const quotaValue = !isNaN(currentQuotaUsage) ? currentQuotaUsage : 0;
  const usedSpace = !isNaN(usedQuotaSpace) ? usedQuotaSpace : 0;
  const totalSpace = !isNaN(totalQuotaSpace) ? totalQuotaSpace : 0;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Uso de Cuota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {quotaValue?.toFixed(1) ?? 0}%
          </div>
          <Progress value={quotaValue} max={100} />
          <p className="text-xs text-muted-foreground mt-2">
            {formatBytes(usedSpace * 1024 * 1024)} de{" "}
            {formatBytes(totalSpace * 1024 * 1024)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const ErrorDetails = memo(function ErrorDetails({
  latestBackup,
}: {
  latestBackup: any;
}) {
  if (!latestBackup.HasErrors) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="mb-8 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            Detalles del Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestBackup.Exception && (
            <div>
              <h4 className="font-semibold mb-2">Excepción:</h4>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                {latestBackup.Exception}
              </pre>
            </div>
          )}
          {latestBackup.LogLines && latestBackup.LogLines.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Registros de Error:</h4>
              <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
                {latestBackup.LogLines.map((log: string, idx: number) => (
                  <div key={idx} className="text-sm font-mono mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">
                Contador de Errores
              </p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {!isNaN(latestBackup.ErrorsCount)
                  ? latestBackup.ErrorsCount
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Intentos de Reintentos
              </p>
              <p className="text-lg font-semibold">
                {!isNaN(latestBackup.RetryAttempts)
                  ? latestBackup.RetryAttempts
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default function MachineDetailPage({
  params,
}: {
  params: Promise<{ machineName: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const machineName = decodeURIComponent(resolvedParams.machineName);

  const { data, isLoading } = useQuery({
    queryKey: ["machine", machineName],
    queryFn: () => fetchMachineDetails(machineName),
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const healthColors = useMemo(() => {
    if (!data) return { color: "#6b7280", label: "N/A" };
    return getHealthScoreColor(data.healthScore);
  }, [data]);

  const statusBadgeVariant = useMemo(() => {
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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
          <Button onClick={handleBack}>Volver al Panel</Button>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-card"
      >
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="default"
            onClick={handleBack}
            className="mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {data.machineName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Último respaldo: {data.latestBackup.RelativeEndTime || "N/A"}
              </p>
            </div>

            <Badge
              variant={statusBadgeVariant as any}
              className="text-lg py-2 px-4 self-start md:self-auto"
            >
              {data.latestBackup.Status}
            </Badge>
          </div>
        </div>
      </motion.div>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
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

          <MetricCard
            title="Respaldos Totales"
            icon={<HardDrive className="w-8 h-8 text-blue-500" />}
            value={totalBackups}
            subtitle={`${formatBytes(averageSize * 1024 * 1024)} prom`}
            index={1}
          />

          <MetricCard
            title="Tasa de Éxito"
            icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
            value={`${successRate}%`}
            subtitle={`${data.statusDistribution.success} de ${totalBackups}`}
            index={2}
          />

          <QuotaCard
            currentQuotaUsage={data.currentQuotaUsage}
            usedQuotaSpace={data.latestBackup.UsedQuotaSpaceMB}
            totalQuotaSpace={data.latestBackup.TotalQuotaSpaceMB}
            index={3}
          />
        </div>

        {/* Charts */}
        <BackupCharts
          recentBackups={data.recentBackups}
          statusDistribution={data.statusDistribution}
        />

        {/* Latest Backup Details */}
        <ErrorDetails latestBackup={data.latestBackup} />

        {/* Backup History */}
        <BackupHistoryTable machineName={machineName} />
      </main>
    </div>
  );
}
