import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BackupStatus } from "@/types/backup";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: BackupStatus): {
  bg: string;
  text: string;
  border: string;
  iconColor: string;
} {
  switch (status) {
    case "SUCCESS":
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
        iconColor: "#10b981"
      };
    case "WARNING":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
        iconColor: "#f59e0b"
      };
    case "PARTIAL":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
        iconColor: "#3b82f6"
      };
    case "ERROR":
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        iconColor: "#ef4444"
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950/20",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800",
        iconColor: "#6b7280"
      };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getDecimalPrecision(value: number): number {
  const absoluteValue = Math.abs(value);
  if (absoluteValue < 10) return 2;
  if (absoluteValue < 100) return 1;
  return 0;
}

export function parseDurationToMinutes(duration: string): number {
  if (!duration || typeof duration !== "string") return 0;
  const parts = duration.split(":");
  if (parts.length !== 3) return 0;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  const seconds = Number(parts[2]);

  if (![hours, minutes, seconds].every(Number.isFinite)) return 0;
  if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return 0;
  return Math.max(0, hours * 60 + minutes + seconds / 60);
}

export function formatDurationFromMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0 min";

  if (totalMinutes < 1) {
    return `${Math.max(1, Math.round(totalMinutes * 60))} s`;
  }

  if (totalMinutes < 60) {
    const totalSeconds = Math.round(totalMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes >= 10 || seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds} s`;
  }

  if (totalMinutes < 1440) {
    const roundedMinutes = Math.round(totalMinutes);
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }

  const roundedMinutes = Math.round(totalMinutes);
  const days = Math.floor(roundedMinutes / 1440);
  const hours = Math.floor((roundedMinutes % 1440) / 60);
  if (hours === 0) return `${days} d`;
  return `${days} d ${hours} h`;
}

export function formatSizeFromMB(sizeMB: number): string {
  if (!Number.isFinite(sizeMB) || sizeMB <= 0) return "0 MB";

  let value = sizeMB;
  let unit = "MB";

  if (Math.abs(sizeMB) >= 1024 * 1024) {
    value = sizeMB / (1024 * 1024);
    unit = "TB";
  } else if (Math.abs(sizeMB) >= 1024) {
    value = sizeMB / 1024;
    unit = "GB";
  }

  const decimals = getDecimalPrecision(value);
  const formattedValue = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDuration(duration: string): string {
  return formatDurationFromMinutes(parseDurationToMinutes(duration));
}

export function calculateHealthScore(
  successRate: number,
  quotaUsage: number,
  hasRecentBackup: boolean,
  errorCount: number
): number {
  let score = 100;

  // Success rate impact (40 points)
  score -= (100 - successRate) * 0.4;

  // Quota usage impact (20 points)
  if (quotaUsage > 90) score -= 20;
  else if (quotaUsage > 80) score -= 10;
  else if (quotaUsage > 70) score -= 5;

  // Recent backup impact (20 points)
  if (!hasRecentBackup) score -= 20;

  // Error count impact (20 points)
  score -= Math.min(errorCount * 5, 20);

  return Math.max(0, Math.round(score));
}

export function getHealthScoreColor(score: number): {
  color: string;
  label: string;
} {
  if (score >= 90) return { color: "#10b981", label: "Excelente" };
  if (score >= 75) return { color: "#3b82f6", label: "Bueno" };
  if (score >= 60) return { color: "#f59e0b", label: "Regular" };
  return { color: "#ef4444", label: "Deficiente" };
}
