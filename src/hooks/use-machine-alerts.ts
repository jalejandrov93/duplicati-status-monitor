import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MachineStatus } from "@/types/backup";

export function useMachineAlerts(machines: MachineStatus[]) {
  const hasShownNotificationsRef = useRef(false);

  useEffect(() => {
    if (machines.length === 0 || hasShownNotificationsRef.current) return;

    const errorMachines = machines.filter((m) => m.latestBackup.Status === "ERROR");
    const warningMachines = machines.filter(
      (m) =>
        m.latestBackup.Status === "WARNING" || m.latestBackup.Status === "PARTIAL",
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
  }, [machines]);
}
