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
import { format } from "date-fns";
import { motion } from "framer-motion";

interface BackupChartsProps {
  recentBackups: any[];
  statusDistribution: {
    success: number;
    warning: number;
    error: number;
    partial: number;
  };
}

const STATUS_COLORS = {
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  PARTIAL: "#3b82f6",
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

function parseDuration(duration: string): number {
  if (!duration || typeof duration !== "string") return 0;
  const parts = duration.split(":");
  if (parts.length === 3) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    const result = hours * 60 + minutes + seconds / 60;
    return isNaN(result) ? 0 : result;
  }
  return 0;
}

export const BackupCharts = memo(function BackupCharts({
  recentBackups,
  statusDistribution,
}: BackupChartsProps) {
  // Memoize trend data calculation
  const trendData = useMemo(() => {
    if (!recentBackups || recentBackups.length === 0) return [];

    return recentBackups
      .slice(0, 30)
      .reverse()
      .map((backup) => ({
        date: format(new Date(backup.EndTime), "MM/dd"),
        size: !isNaN(backup.SizeOfExaminedFilesMB) ? backup.SizeOfExaminedFilesMB : 0,
        files: !isNaN(backup.ExaminedFiles) ? backup.ExaminedFiles : 0,
        duration: parseDuration(backup.Duration),
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
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
    }),
    []
  );

  const tickStyle = useMemo(() => ({ fill: "hsl(var(--muted-foreground))" }), []);

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
                  width={40}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="size"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Tamaño (MB)"
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
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
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
                  width={40}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="files"
                  fill="#10b981"
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
            <CardTitle className="text-sm">Duración (min)</CardTitle>
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
                  width={40}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 3 }}
                  name="Duración (min)"
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
