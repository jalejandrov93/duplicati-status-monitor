import { NextRequest, NextResponse } from "next/server";
import { isCpanelConfigured } from "@/lib/email/cpanel-client";
import { getEmailDashboardData } from "@/lib/email/email-quota";
import { getClientIp, isEmailMonitorIpAllowed } from "@/lib/ip-access";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request: NextRequest) => {
  const clientIp = getClientIp(request);

  if (!isEmailMonitorIpAllowed(clientIp)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isCpanelConfigured()) {
    return NextResponse.json(
      { error: "Servicio no configurado" },
      { status: 503 },
    );
  }

  const data = await getEmailDashboardData();
  return NextResponse.json(data);
});
