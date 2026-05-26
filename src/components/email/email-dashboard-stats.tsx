"use client";

import { Mail, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { EmailStats, EmailStatusFilter } from "@/types/email";

interface EmailDashboardStatsProps {
  stats: EmailStats | undefined;
  onFilterClick?: (filter: EmailStatusFilter) => void;
  activeFilter?: EmailStatusFilter | null;
}

export function EmailDashboardStats({
  stats,
  onFilterClick,
  activeFilter,
}: EmailDashboardStatsProps) {
  if (!stats) return null;

  const handleFilterClick = (filter: EmailStatusFilter) => {
    if (onFilterClick) onFilterClick(filter);
  };

  const isActive = (filter: EmailStatusFilter) => activeFilter === filter;

  return (
    <div className="z-10 mb-6">
      {activeFilter && activeFilter !== "all" && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtrado por:</span>
          <span className="font-medium capitalize">
            {activeFilter === "success"
              ? "Normales"
              : activeFilter === "warning"
                ? "Advertencias"
                : "Críticos"}
          </span>
          <button
            type="button"
            onClick={() => handleFilterClick("all")}
            className="ml-2 rounded-full p-1 transition-colors hover:bg-muted"
            title="Limpiar filtro"
            aria-label="Limpiar filtro"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => handleFilterClick("all")}
          className={`relative flex cursor-pointer items-center gap-3 rounded-xl bg-blue-100 p-4 text-card-foreground shadow-sm transition-all hover:scale-105 dark:bg-blue-900/80 ${
            isActive("all")
              ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background"
              : ""
          }`}
        >
          <div className="shrink-0 rounded-lg p-2">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.totalAccounts}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterClick("success")}
          className={`relative flex cursor-pointer items-center gap-3 rounded-xl bg-green-100 p-4 text-card-foreground shadow-sm transition-all hover:scale-105 dark:bg-green-900/80 ${
            isActive("success")
              ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-background"
              : ""
          }`}
        >
          <div className="shrink-0 rounded-lg p-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Normales</p>
            <p className="text-2xl font-bold">{stats.successAccounts}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterClick("warning")}
          className={`relative flex cursor-pointer items-center gap-3 rounded-xl bg-yellow-100 p-4 text-card-foreground shadow-sm transition-all hover:scale-105 dark:bg-yellow-900/80 ${
            isActive("warning")
              ? "ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-background"
              : ""
          }`}
        >
          <div className="shrink-0 rounded-lg p-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Advertencias</p>
            <p className="text-2xl font-bold">{stats.warningAccounts}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterClick("error")}
          className={`relative flex cursor-pointer items-center gap-3 rounded-xl bg-red-100 p-4 text-card-foreground shadow-sm transition-all hover:scale-105 dark:bg-red-900/80 ${
            isActive("error")
              ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-background"
              : ""
          }`}
        >
          <div className="shrink-0 rounded-lg p-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Críticos</p>
            <p className="text-2xl font-bold">{stats.errorAccounts}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
