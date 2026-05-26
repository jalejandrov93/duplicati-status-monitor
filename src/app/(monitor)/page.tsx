import { getMachinesData } from "@/app/api/machines/route";
import DashboardClient from "@/components/dashboard-client";

export default async function HomePage() {
  const initialMachines = await getMachinesData();

  return <DashboardClient initialMachines={initialMachines} />;
}
