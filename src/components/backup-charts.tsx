"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, isValid } from "date-fns";
import { motion } from "framer-motion";
import {
  formatCompactNumber,
  formatDurationFromMinutes,
  formatSizeFromMB,
  parseDurationToMinutes,
} from "@/lib/utils";
import type { BackupRecord, StatusDistribution } from "@/types/machine";

interface BackupChartsProps {
  recentBackups: BackupRecord[];
  statusDistribution: StatusDistribution;
}

const STATUS_COLORS = {
  SUCCESS: "var(--chart-2)",
  WARNING: "var(--chart-4)",
  ERROR: "var(--destructive)",
  PARTIAL: "var(--chart-1)",
};

const chartVariants = {
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

export const BackupCharts = memo(function BackupCharts({
  recentBackups,
  statusDistribution,
}: BackupChartsProps) {
  const toFiniteNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  // Memoize trend data calculation
  const trendData = useMemo(() => {
    if (!recentBackups || recentBackups.length === 0) return [];

    return recentBackups
      .slice(0, 30)
      .reverse()
      .map((backup) => ({
        date: isValid(new Date(backup.EndTime))
          ? format(new Date(backup.EndTime), "MM/dd")
          : "N/A",
        size: Number.isFinite(backup.SizeOfExaminedFilesMB) ? backup.SizeOfExaminedFilesMB : 0,
        files: Number.isFinite(backup.ExaminedFiles) ? backup.ExaminedFiles : 0,
        duration: parseDurationToMinutes(backup.Duration),
      }));
  }, [recentBackups]);

  // Memoize status distribution data
  const statusData = useMemo(() => {
    return [
      { name: "Éxito", value: statusDistribution.success || 0, color: STATUS_COLORS.SUCCESS },
      { name: "Advertencia", value: statusDistribution.warning || 0, color: STATUS_COLORS.WARNING },
      { name: "Error", value: statusDistribution.error || 0, color: STATUS_COLORS.ERROR },
      { name: "Parcial", value: statusDistribution.partial || 0, color: STATUS_COLORS.PARTIAL },
    ].filter((item) => item.value > 0);
  }, [statusDistribution]);

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "0.5rem",
      color: "var(--card-foreground)",
    }),
    []
  );

  const tickStyle = useMemo(() => ({ fill: "var(--muted-foreground)" }), []);
  const totalStatusCount = useMemo(
    () => statusData.reduce((acc, item) => acc + item.value, 0),
    [statusData]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-8">
      {/* Backup Size Trend */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={chartVariants}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tamaño de Respaldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                />
                <YAxis
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                  width={58}
                  tickFormatter={(value) => formatSizeFromMB(toFiniteNumber(value))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatSizeFromMB(toFiniteNumber(value))}
                />
                <Area
                  type="monotone"
                  dataKey="size"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.3}
                  name="Tamaño"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={chartVariants}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={56}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [
                        formatCompactNumber(toFiniteNumber(value)),
                        String(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {statusData.map((item) => {
                    const percent =
                      totalStatusCount > 0
                        ? ((item.value / totalStatusCount) * 100).toFixed(0)
                        : "0";
                    return (
                      <div key={item.name} className="flex items-center justify-between gap-2">
                        <span className="truncate">{item.name}</span>
                        <span>{`${formatCompactNumber(item.value)} (${percent}%)`}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="flex h-45 items-center justify-center text-sm text-muted-foreground">
                Sin datos recientes
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Files Processed */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={chartVariants}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Archivos Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                />
                <YAxis
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                  width={48}
                  tickFormatter={(value) => formatCompactNumber(toFiniteNumber(value))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCompactNumber(toFiniteNumber(value))}
                />
                <Bar
                  dataKey="files"
                  fill="var(--chart-2)"
                  name="Archivos"
                  animationDuration={800}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Duration Trend */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={chartVariants}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Duración</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                />
                <YAxis
                  className="text-xs"
                  tick={tickStyle}
                  fontSize={10}
                  width={58}
                  tickFormatter={(value) => formatDurationFromMinutes(toFiniteNumber(value))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatDurationFromMinutes(toFiniteNumber(value))}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-4)", r: 3 }}
                  name="Duración"
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});
