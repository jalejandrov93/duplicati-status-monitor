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

export function formatDuration(duration: string): string {
  // Duration is in format like "00:05:23" (HH:MM:SS)
  return duration;
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
