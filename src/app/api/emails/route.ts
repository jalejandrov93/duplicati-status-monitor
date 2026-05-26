import { NextRequest, NextResponse } from "next/server";
import { isCpanelConfigured } from "@/lib/email/cpanel-client";
import { getEmailDashboardData } from "@/lib/email/email-quota";
import { getClientIp, isEmailMonitorIpAllowed } from "@/lib/ip-access";

export async function GET(request: NextRequest) {
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

  try {
    const data = await getEmailDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error obteniendo cuotas de correo:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las cuotas de correo" },
      { status: 502 },
    );
  }
}
