"use client";

import { RefreshCw, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo / Title */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Monitor Duplicati
          </h1>
          {stats && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              Actualizado: {format(new Date(stats.lastUpdated), "HH:mm:ss")}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 w-full bg-background"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 rounded-full"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Actualizar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
