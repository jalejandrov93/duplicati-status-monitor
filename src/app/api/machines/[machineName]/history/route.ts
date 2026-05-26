import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Backup from "@/models/Backup";
import { BackupHistoryResponse } from "@/types/backup";
import { apiHandler } from "@/lib/api-handler";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ machineName: string }> }
) => {
  const { machineName } = await params;
  const decodedMachineName = decodeURIComponent(machineName);
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  await connectDB();

  // Build query
  const query: any = { MachineName: decodedMachineName };

  if (status) {
    query.Status = status;
  }

  if (startDate || endDate) {
    query.EndTime = {};
    if (startDate) {
      query.EndTime.$gte = new Date(startDate);
    }
    if (endDate) {
      query.EndTime.$lte = new Date(endDate);
    }
  }

  // Get total count
  const total = await Backup.countDocuments(query);

  // Get paginated backups
  const backups = await Backup.find(query)
    .sort({ EndTime: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const response: BackupHistoryResponse = {
    backups,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  return NextResponse.json(response);
});

