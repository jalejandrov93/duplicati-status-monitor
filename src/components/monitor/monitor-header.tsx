"use client";

import { RefreshCw, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { MonitorNav } from "@/components/monitor-nav";
import {
  useMonitorToolbarActions,
  useMonitorToolbarState,
} from "@/components/monitor/monitor-toolbar-context";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/": "Monitor Duplicati",
  "/correos": "Monitor de Correos",
};

export function MonitorHeader() {
  const pathname = usePathname();
  const { searchPlaceholder, searchTerm, isRefreshing, meta, actionsRevision } =
    useMonitorToolbarState();
  const actionsRef = useMonitorToolbarActions();
  const { onSearchChange, onRefresh, actionsSlot } = actionsRef.current;

  const title = routeTitles[pathname] ?? "Monitor";

  return (
    <header className="sticky top-0 z-20 w-full shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto grid h-16 grid-cols-[minmax(0,1fr)_minmax(0,16rem)_auto] items-center gap-4 px-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_auto]">
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>
            <MonitorNav />
          </div>
          {meta ? (
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          ) : (
            <p className="hidden text-xs sm:block" aria-hidden="true">
              &nbsp;
            </p>
          )}
        </div>

        <div className="min-w-0">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-full bg-background pl-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div
            key={actionsRevision}
            className="flex min-w-[4.5rem] items-center justify-end"
          >
            {actionsSlot ?? <span className="sr-only">Sin acciones extra</span>}
          </div>

          <AnimatedThemeToggler
            aria-label="Cambiar tema"
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              "text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              "[&_svg]:h-4 [&_svg]:w-4",
            )}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="h-9 w-9 shrink-0 rounded-full"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="sr-only">Actualizar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
