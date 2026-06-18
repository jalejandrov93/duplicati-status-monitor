"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Monitor,
  LayoutDashboard,
  Mail,
  Moon,
  Sun,
  RefreshCw,
  Command as CommandIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { getStatusConfig } from "@/lib/status-utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { machines, refresh, isRefreshing } = useDashboardData([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    command();
    setOpen(false);
    setQuery("");
  }, []);

  const filteredMachines = query === ""
    ? machines.slice(0, 5)
    : machines.filter((machine) =>
        machine.machineName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const navigationItems = [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard Principal", action: () => router.push("/") },
    { icon: <Mail className="h-4 w-4" />, label: "Monitor de Correos", action: () => router.push("/correos") },
  ];

  const systemItems = [
    {
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      label: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
      action: () => setTheme(theme === "dark" ? "light" : "dark")
    },
    {
      icon: <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />,
      label: "Actualizar datos ahora",
      action: () => refresh()
    },
  ];

  const machineItems = filteredMachines.map(m => ({
    icon: <Monitor className={cn("h-4 w-4", getStatusConfig(m.latestBackup.Status).iconColor)} />,
    label: m.machineName,
    badge: m.latestBackup.Status,
    action: () => router.push(`/machine/${encodeURIComponent(m.machineName)}`)
  }));

  const allItems = [...navigationItems, ...machineItems, ...systemItems];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % allItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + allItems.length) % allItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          runCommand(allItems[selectedIndex].action);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, allItems, runCommand]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={cn(
              "relative w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-2xl",
              "mx-4 flex flex-col"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de comandos"
          >
            <div className="flex items-center border-b px-4 py-3">
              <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Escribe un comando o busca una máquina..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>

            <div
              ref={scrollContainerRef}
              className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin"
              role="listbox"
            >
              {/* Navegación */}
              <div className="mb-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Navegación
              </div>
              {navigationItems.map((item, i) => (
                <CommandItem
                  key={item.label}
                  active={selectedIndex === i}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => runCommand(item.action)}
                />
              ))}

              {/* Máquinas */}
              {machineItems.length > 0 && (
                <>
                  <div className="mt-4 mb-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Máquinas
                  </div>
                  {machineItems.map((item, i) => (
                    <CommandItem
                      key={item.label}
                      active={selectedIndex === i + navigationItems.length}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      onClick={() => runCommand(item.action)}
                    />
                  ))}
                </>
              )}

              {/* Sistema */}
              <div className="mt-4 mb-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sistema
              </div>
              {systemItems.map((item, i) => (
                <CommandItem
                  key={item.label}
                  active={selectedIndex === i + navigationItems.length + machineItems.length}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => runCommand(item.action)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1">↑↓</kbd> Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1">ENTER</kbd> Seleccionar
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CommandIcon className="h-3 w-3" />
                <span>CMD + K para abrir</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandItem({
  icon,
  label,
  onClick,
  badge,
  active
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors outline-none",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 hover:text-accent-foreground text-foreground/80"
      )}
      onClick={onClick}
      role="option"
      aria-selected={active}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm transition-colors",
        active ? "bg-background border-primary/30" : "bg-background/50 border-border"
      )}>
        {icon}
      </div>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
          active ? "bg-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
