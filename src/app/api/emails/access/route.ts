import { NextRequest, NextResponse } from "next/server";
import { getClientIp, isEmailMonitorIpAllowed } from "@/lib/ip-access";

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const hasAccess = isEmailMonitorIpAllowed(clientIp);

  return NextResponse.json({ hasAccess });
}
