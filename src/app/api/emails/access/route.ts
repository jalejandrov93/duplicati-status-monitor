import { NextRequest, NextResponse } from "next/server";
import { getClientIp, isEmailMonitorIpAllowed } from "@/lib/ip-access";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request: NextRequest) => {
  const clientIp = getClientIp(request);
  const hasAccess = isEmailMonitorIpAllowed(clientIp);

  return NextResponse.json({ hasAccess });
});
