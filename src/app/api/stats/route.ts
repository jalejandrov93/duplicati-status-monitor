import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Backup from "@/models/Backup";
import { GlobalStats } from "@/types/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Get latest backup for each machine
    const latestBackups = await Backup.aggregate([
      {
        $sort: { EndTime: -1 }
      },
      {
        $group: {
          _id: "$MachineName",
          latestBackup: { $first: "$$ROOT" }
        }
      }
    ]);

    const totalMachines = latestBackups.length;
    let successfulMachines = 0;
    let warningMachines = 0;
    let errorMachines = 0;

    latestBackups.forEach((machine) => {
      const status = machine.latestBackup.Status;
      if (status === "SUCCESS") successfulMachines++;
      else if (status === "WARNING" || status === "PARTIAL") warningMachines++;
      else if (status === "ERROR") errorMachines++;
    });

    // Get total backups count
    const totalBackups = await Backup.countDocuments();

    const stats: GlobalStats = {
      totalMachines,
      successfulMachines,
      warningMachines,
      errorMachines,
      totalBackups,
      lastUpdated: new Date()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas globales:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
