import { NextRequest, NextResponse } from "next/server";
import { getOutlookConfig } from "@/lib/email/cpanel-actions";
import { getClientIp, isEmailMonitorIpAllowed } from "@/lib/ip-access";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request: NextRequest) => {
  const clientIp = getClientIp(request);

  if (!isEmailMonitorIpAllowed(clientIp)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim();

  if (!email) {
    return NextResponse.json(
      { error: "El email es requerido" },
      { status: 400 },
    );
  }

  const config = await getOutlookConfig(email);
  if (!config) {
    return NextResponse.json(
      { error: "No se pudieron obtener las configuraciones" },
      { status: 500 },
    );
  }

  return NextResponse.json(config);
});
