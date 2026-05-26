import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Backup from "@/models/Backup";
import { calculateHealthScore } from "@/lib/health-score";
import { apiHandler } from "@/lib/api-handler";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ machineName: string }> }
) => {
  const { machineName } = await params;
  const decodedMachineName = decodeURIComponent(machineName);

  await connectDB();

  // Get machine statistics
  const stats = await Backup.aggregate([
    { $match: { MachineName: decodedMachineName } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalBackups: { $sum: 1 },
              successCount: {
                $sum: { $cond: [{ $eq: ["$Status", "SUCCESS"] }, 1, 0] }
              },
              warningCount: {
                $sum: { $cond: [{ $eq: ["$Status", "WARNING"] }, 1, 0] }
              },
              errorCount: {
                $sum: { $cond: [{ $eq: ["$Status", "ERROR"] }, 1, 0] }
              },
              partialCount: {
                $sum: { $cond: [{ $eq: ["$Status", "PARTIAL"] }, 1, 0] }
              },
              totalSize: { $sum: "$SizeOfExaminedFilesMB" },
              totalFiles: { $sum: "$ExaminedFiles" },
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
          }
        ],
        latestBackup: [
          { $sort: { EndTime: -1 } },
          { $limit: 1 }
        ],
        recentBackups: [
          { $sort: { EndTime: -1 } },
          { $limit: 30 },
          {
            $project: {
              EndTime: 1,
              Status: 1,
              Duration: 1,
              SizeOfExaminedFilesMB: 1,
              ExaminedFiles: 1,
              AddedFiles: 1,
            }
          }
        ]
      }
    }
  ]);

  if (!stats[0] || !stats[0].summary[0]) {
    return NextResponse.json(
      { error: "Máquina no encontrada" },
      { status: 404 }
    );
  }

  const summary = stats[0].summary[0];
  const latestBackup = stats[0].latestBackup[0];
  const recentBackups = stats[0].recentBackups;

  const successRate = (summary.successCount / summary.totalBackups) * 100;
  const averageSize = summary.totalSize / summary.totalBackups;

  const now = new Date();
  const lastBackupTime = new Date(latestBackup.EndTime);
  const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);
  const hasRecentBackup = hoursSinceLastBackup < 48;

  const healthScore = calculateHealthScore(
    successRate,
    latestBackup.QuotaUsagePercent,
    hasRecentBackup,
    latestBackup.ErrorsCount
  );

  const response = {
    machineName: decodedMachineName,
    latestBackup,
    totalBackups: summary.totalBackups,
    successRate,
    averageSize,
    lastSuccessfulBackup: summary.lastSuccessful,
    currentQuotaUsage: latestBackup.QuotaUsagePercent,
    healthScore,
    statusDistribution: {
      success: summary.successCount,
      warning: summary.warningCount,
      error: summary.errorCount,
      partial: summary.partialCount
    },
    recentBackups,
    totalFilesProcessed: summary.totalFiles
  };

  return NextResponse.json(response);
});

