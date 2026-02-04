"use client";

import { useState } from "react";
import { RefreshCw, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlobalStats } from "@/types/backup";
import { useTheme } from "next-themes";
import { format } from "date-fns";

interface DashboardHeaderProps {
  stats: GlobalStats | undefined;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function DashboardHeader({
  stats,
  isRefreshing,
  onRefresh,
  searchTerm,
  onSearchChange,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="shadow-xs rounded-4xl sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Monitor de Respaldos Duplicati
            </h1>
            {stats && (
              <p className="text-sm text-muted-foreground mt-1">
                Última actualización: {format(new Date(stats.lastUpdated), "PPpp")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg shadow p-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Máquinas Totales</p>
                <p className="text-2xl font-bold">{stats.totalMachines}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg shadow p-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Exitosas</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.successfulMachines}
                  </p>
                  <Badge variant="success" className="text-xs">
                    OK
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg shadow p-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Advertencias</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.warningMachines}
                  </p>
                  {stats.warningMachines > 0 && (
                    <Badge variant="warning" className="text-xs">
                      ADVERT
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg shadow p-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Errores</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.errorMachines}
                  </p>
                  {stats.errorMachines > 0 && (
                    <Badge variant="error" className="text-xs">
                      ERROR
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar máquinas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow"
          />
        </div>
      </div>
    </div>
  );
}
