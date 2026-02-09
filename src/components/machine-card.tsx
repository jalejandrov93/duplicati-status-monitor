"use client";

import { MachineStatus } from "@/types/backup";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import {
  Activity,
  HardDrive,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import GlareHover from "@/components/GlareHover";

interface MachineCardProps {
  machine: MachineStatus;
  index: number;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return {
        borderColor: "border-green-500",
        glowColor: "#10b981",
        iconColor: "text-green-500",
        bgColor: "bg-green-500/5",
        Icon: CheckCircle2,
        label: "Operacional",
      };
    case "WARNING":
      return {
        borderColor: "border-yellow-500",
        glowColor: "#f59e0b",
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-500/5",
        Icon: AlertTriangle,
        label: "Advertencia",
      };
    case "ERROR":
      return {
        borderColor: "border-red-500",
        glowColor: "#ef4444",
        iconColor: "text-red-500",
        bgColor: "bg-red-500/5",
        Icon: XCircle,
        label: "Crítico",
      };
    default:
      return {
        borderColor: "border-gray-500",
        glowColor: "#6b7280",
        iconColor: "text-gray-500",
        bgColor: "bg-gray-500/5",
        Icon: Activity,
        label: "Desconocido",
      };
  }
};

const getHealthColor = (score: number) => {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
};

export function MachineCard({ machine, index }: MachineCardProps) {
  const statusConfig = getStatusConfig(machine.latestBackup.Status);
  const StatusIcon = statusConfig.Icon;
  const healthColor = getHealthColor(machine.healthScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full border-none"
    >
      <Link href={`/machine/${encodeURIComponent(machine.machineName)}`}>

        <div className="group relative h-full w-full transition-all duration-300 ease-out">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl",
              "border-2 transition-all duration-500",
              statusConfig.borderColor,
              "bg-card",
              "shadow-lg hover:shadow-2xl"
            )}
          >
            {/* Gradient Background Overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100",
                "transition-opacity duration-500",
                "bg-gradient-to-br from-transparent via-transparent to-current/5",
                statusConfig.iconColor
              )}
            />

            {/* Screen Content */}
            <div className="relative p-5 space-y-3">
              {/* Header Section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className={cn(
                      "relative shrink-0",
                      "w-12 h-12 rounded-xl",
                      "flex items-center justify-center",
                      statusConfig.bgColor,
                      "border-2",
                      statusConfig.borderColor,
                      "shadow-md"
                    )}
                  >
                    <Activity
                      className={cn("w-6 h-6", statusConfig.iconColor)}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "absolute -top-1 -right-1",
                        "w-3 h-3 rounded-full",
                        "border-2 border-card",
                        statusConfig.iconColor === "text-green-500"
                          ? "bg-green-500"
                          : statusConfig.iconColor === "text-yellow-500"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      )}
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate leading-tight">
                      {machine.machineName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {machine.totalBackups} sesiones de respaldo
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 gap-1 px-2 py-0.5 text-xs",
                    "border-none font-semibold",
                    statusConfig.borderColor,
                    statusConfig.iconColor,
                    "rounded-xl"
                  )}
                >
                  <StatusIcon className="w-6 h-6" />

                </Badge>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Health Score with animated circle */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                  className={cn(
                    "flex flex-col items-center justify-center",
                    "p-2.5 rounded-2xl",
                    "bg-muted/50 border border-border",
                    "relative overflow-hidden"
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground mb-0.5 text-center leading-tight">
                    Puntuación
                  </span>
                  <div className="relative flex items-center justify-center">
                    {/* Animated circular progress */}
                    <svg className="w-14 h-14 -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        fill="none"
                        className="text-muted/30"
                      />
                      <motion.circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke={healthColor}
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: machine.healthScore / 100 }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.1 + 0.3,
                          ease: "easeOut",
                        }}
                      />
                    </svg>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: index * 0.1 + 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span
                        className="text-lg font-bold"
                        style={{ color: healthColor }}
                      >
                        {machine.healthScore ?? 0}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Success Rate */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                  className={cn(
                    "flex flex-col items-center justify-center",
                    "p-2.5 rounded-2xl",
                    "bg-muted/50 border border-border"
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground mb-0.5 text-center leading-tight">
                    Tasa de Éxito
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    {(machine.successRate ?? 0).toFixed(1)}%
                  </span>
                </motion.div>
              </div>

              {/* Details Section - Compact */}
              <div className="space-y-1.5">
                {/* Last Backup */}
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground truncate">
                    Último respaldo:
                  </span>
                  <span className="font-medium text-foreground ml-auto text-right truncate max-w-[50%]">
                    {machine.latestBackup.RelativeEndTime || 'N/A'}
                  </span>
                </div>

                {/* Backup Size */}
                <div className="flex items-center gap-2 text-xs">
                  <HardDrive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground truncate">Tamaño:</span>
                  <span className="font-medium text-foreground ml-auto text-right truncate max-w-[50%]">
                    {machine.latestBackup.SizeOfExaminedFilesMB &&
                      !isNaN(machine.latestBackup.SizeOfExaminedFilesMB)
                      ? formatBytes(machine.latestBackup.SizeOfExaminedFilesMB * 1024 * 1024)
                      : 'N/A'}
                  </span>
                </div>

                {/* Files Examined */}
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground truncate">
                    Archivos:
                  </span>
                  <span className="font-medium text-foreground ml-auto text-right truncate max-w-[50%]">
                    {machine.latestBackup.ExaminedFiles &&
                      !isNaN(machine.latestBackup.ExaminedFiles)
                      ? machine.latestBackup.ExaminedFiles.toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Quota Usage - Bottom section */}
              {machine.currentQuotaUsage != null && (
                <div className="space-y-1.5 pt-1.5 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      Uso de Cuota
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {machine.currentQuotaUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={machine.currentQuotaUsage}
                      max={100}
                      className="h-2 bg-muted rounded-full overflow-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shine effect on card surface */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
