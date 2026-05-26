import { BackupStatus } from "@/types/backup";
import { DuplicatiErrorType } from "@/lib/error-parser";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Lock,
  WifiOff,
  Key,
} from "lucide-react";

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; iconColor: string }> = {
  SUCCESS: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    iconColor: "#10b981",
  },
  WARNING: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    iconColor: "#f59e0b",
  },
  PARTIAL: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "#3b82f6",
  },
  ERROR: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    iconColor: "#ef4444",
  },
};

const DEFAULT_STATUS_COLOR = {
  bg: "bg-gray-50 dark:bg-gray-950/20",
  text: "text-gray-700 dark:text-gray-400",
  border: "border-gray-200 dark:border-gray-800",
  iconColor: "#6b7280",
};

export function getStatusColor(status: BackupStatus | string) {
  return STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
}

export const STATUS_CONFIGS: Record<string, {
  borderColor: string;
  glowColor: string;
  iconColor: string;
  bgColor: string;
  Icon: any;
  label: string;
  shadowColor: string;
}> = {
  SUCCESS: {
    borderColor: "border-green-500",
    glowColor: "#10b981",
    iconColor: "text-green-500",
    bgColor: "bg-green-500/5",
    Icon: CheckCircle2,
    label: "Operacional",
    shadowColor: "shadow-green-500",
  },
  WARNING: {
    borderColor: "border-yellow-500",
    glowColor: "#f59e0b",
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/5",
    Icon: AlertTriangle,
    label: "Advertencia",
    shadowColor: "shadow-yellow-500",
  },
  ERROR: {
    borderColor: "border-red-500",
    glowColor: "#ef4444",
    iconColor: "text-red-500",
    bgColor: "bg-red-500/5",
    Icon: XCircle,
    label: "Crítico",
    shadowColor: "shadow-red-500",
  },
};

const DEFAULT_STATUS_CONFIG = {
  borderColor: "border-gray-500",
  glowColor: "#6b7280",
  iconColor: "text-gray-500",
  bgColor: "bg-gray-500/5",
  Icon: Activity,
  label: "Desconocido",
  shadowColor: "shadow-gray-500",
};

export function getStatusConfig(status: string) {
  return STATUS_CONFIGS[status] || DEFAULT_STATUS_CONFIG;
}

export const ERROR_ICONS: Record<string, any> = {
  MISSING_FILES: Database,
  PERMISSION_DENIED: Lock,
  CONNECTION_ERROR: WifiOff,
  ENCRYPTION_ERROR: Key,
};

export function getErrorIcon(errorType: DuplicatiErrorType) {
  return ERROR_ICONS[errorType] || XCircle;
}
