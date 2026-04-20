import { MachineStatus, BackupStatus } from "@/types/backup";

export type DashboardStatusFilter = "all" | "success" | "warning" | "error";

function matchesStatusFilter(
  status: BackupStatus,
  filter: DashboardStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "success") return status === "SUCCESS";
  if (filter === "warning") return status === "WARNING" || status === "PARTIAL";
  return status === "ERROR";
}

export function filterMachines(
  machines: MachineStatus[],
  searchTerm: string,
  filter: DashboardStatusFilter,
): MachineStatus[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return machines.filter((machine) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      machine.machineName.toLowerCase().includes(normalizedSearch);

    return matchesSearch && matchesStatusFilter(machine.latestBackup.Status, filter);
  });
}
