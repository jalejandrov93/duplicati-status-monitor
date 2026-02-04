"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MachineCard } from "@/components/machine-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { MachineStatus, GlobalStats } from "@/types/backup";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import PixelBlast from "@/components/PixelBlast";

async function fetchMachines(): Promise<MachineStatus[]> {
  const res = await fetch("/api/machines", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener máquinas");
  return res.json();
}

async function fetchStats(): Promise<GlobalStats> {
  const res = await fetch("/api/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener estadísticas");
  return res.json();
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const hasShownNotificationsRef = useRef(false);

  const {
    data: machines,
    isLoading: machinesLoading,
    refetch: refetchMachines,
  } = useQuery({
    queryKey: ["machines"],
    queryFn: fetchMachines,
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const handleRefresh = () => {
    refetchMachines();
    refetchStats();
    toast.success("Panel actualizado");
  };

  // Show notifications on initial load
  useEffect(() => {
    if (machines && !hasShownNotificationsRef.current) {
      const errorMachines = machines.filter(
        (m) => m.latestBackup.Status === "ERROR",
      );
      const warningMachines = machines.filter(
        (m) =>
          m.latestBackup.Status === "WARNING" ||
          m.latestBackup.Status === "PARTIAL",
      );

      if (errorMachines.length > 0) {
        toast.error(`Crítico: ${errorMachines.length} máquina(s) con errores`, {
          description: errorMachines.map((m) => m.machineName).join(", "),
          duration: 10000,
        });
      }

      if (warningMachines.length > 0) {
        toast.warning(`${warningMachines.length} máquina(s) con advertencias`, {
          description: warningMachines.map((m) => m.machineName).join(", "),
          duration: 5000,
        });
      }

      hasShownNotificationsRef.current = true;
    }
  }, [machines]);

  // Filter machines based on search
  const filteredMachines = machines?.filter((machine) =>
    machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        stats={stats}
        isRefreshing={machinesLoading}
        onRefresh={handleRefresh}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="container mx-auto px-4 py-8">
        {machinesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          <>
            {/* Real-time update indicator */}
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
              <span>Auto-actualización cada 15 segundos</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMachines.map((machine, index) => (
                <MachineCard key={machine.machineName} machine={machine} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              No se encontraron máquinas
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm
                ? "Intenta ajustar tus términos de búsqueda"
                : "Esperando la llegada de reportes de respaldo"}
            </p>
          </div>
        )}
      </main>
      
    </div>
  );
}
