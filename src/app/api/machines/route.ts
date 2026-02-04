import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Backup from "@/models/Backup";
import { MachineStatus } from "@/types/backup";
import { calculateHealthScore } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Get all unique machine names with their latest backup
    const machines = await Backup.aggregate([
      {
        $sort: { EndTime: -1 }
      },
      {
        $group: {
          _id: "$MachineName",
          latestBackup: { $first: "$$ROOT" },
          totalBackups: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$Status", "SUCCESS"] }, 1, 0] }
          },
          totalSize: { $sum: "$SizeOfExaminedFilesMB" },
          lastSuccessful: {
            $max: {
              $cond: [
                { $eq: ["$Status", "SUCCESS"] },
                "$EndTime",
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          machineName: "$_id",
          latestBackup: 1,
          totalBackups: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successCount", "$totalBackups"] },
              100
            ]
          },
          averageSize: {
            $divide: ["$totalSize", "$totalBackups"]
          },
          lastSuccessfulBackup: "$lastSuccessful",
          currentQuotaUsage: "$latestBackup.QuotaUsagePercent",
          _id: 0
        }
      }
    ]);

    // Calculate health score for each machine
    const machinesWithHealth: MachineStatus[] = machines.map((machine) => {
      const now = new Date();
      const lastBackupTime = new Date(machine.latestBackup.EndTime);
      const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);
      const hasRecentBackup = hoursSinceLastBackup < 48; // Within 48 hours

      const healthScore = calculateHealthScore(
        machine.successRate,
        machine.currentQuotaUsage,
        hasRecentBackup,
        machine.latestBackup.ErrorsCount
      );

      return {
        ...machine,
        healthScore
      };
    });

    // Sort by health score (ascending) to show problematic machines first
    machinesWithHealth.sort((a, b) => a.healthScore - b.healthScore);

    return NextResponse.json(machinesWithHealth);
  } catch (error) {
    console.error("Error al obtener máquinas:", error);
    return NextResponse.json(
      { error: "Error al obtener máquinas" },
      { status: 500 }
    );
  }
}
