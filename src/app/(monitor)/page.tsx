import { getMachinesData } from "@/app/api/machines/route";
import DashboardClient from "@/components/dashboard-client";
import { MachineStatus } from "@/types/backup";

export default async function HomePage() {
  let initialMachines: MachineStatus[] = [];
  let dbError: string | null = null;

  try {
    initialMachines = await getMachinesData();
  } catch (error) {
    console.error("Error al inicializar el dashboard (server-side):", error);
    dbError = error instanceof Error ? error.message : "Error de conexión con la base de datos";
  }

  return <DashboardClient initialMachines={initialMachines} dbError={dbError} />;
}
