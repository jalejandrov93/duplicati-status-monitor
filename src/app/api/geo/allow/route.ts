import { NextRequest, NextResponse } from "next/server";
import maxmind, { type Reader, type Response } from "maxmind";
import { promises as fs } from "fs";
import { apiHandler } from "@/lib/api-handler";

type GeoLiteCountry = Response & {
  country?: { iso_code?: string | null } | null;
};

// Este endpoint está excluido del middleware (shouldBypass lo permite).
// Usalo para diagnosticar qué IP y país detecta el servidor en producción.
// IMPORTANTE: removelo o protegelo con un secret antes de hacer la app pública.
export const GET = apiHandler(async (request: NextRequest) => {
  const dbPath = process.env.GEOIP_DB_PATH;
  const allowedCountries = (process.env.ALLOWED_COUNTRIES ?? "CO")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  // Extraer IP igual que el middleware
  function normalizeIp(raw: string | null): string | null {
    if (!raw) return null;
    const first = raw.split(",")[0]?.trim();
    if (!first) return null;
    if (first.startsWith("::ffff:")) return first.slice(7);
    const ipv4WithPort = first.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
    if (ipv4WithPort) return ipv4WithPort[1];
    return first;
  }

  const rawXff = request.headers.get("x-forwarded-for");
  const rawRealIp = request.headers.get("x-real-ip");
  const clientIp = normalizeIp(rawXff) ?? normalizeIp(rawRealIp);

  // Intentar abrir DB
  let countryCode: string | null = null;
  let dbError: string | null = null;
  let dbExists = false;

  if (!dbPath) {
    dbError = "GEOIP_DB_PATH no está definida en las variables de entorno";
  } else {
    try {
      await fs.access(dbPath);
      dbExists = true;
      const reader: Reader<GeoLiteCountry> = await maxmind.open<GeoLiteCountry>(dbPath);
      if (clientIp) {
        const geo = reader.get(clientIp);
        countryCode = geo?.country?.iso_code?.toUpperCase() ?? null;
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e);
    }
  }

  const allowed = countryCode ? allowedCountries.includes(countryCode) : false;

  return NextResponse.json({
    headers: {
      "x-forwarded-for": rawXff,
      "x-real-ip": rawRealIp,
    },
    clientIp,
    dbPath,
    dbExists,
    dbError,
    countryCode,
    allowedCountries,
    allowed,
    verdict: allowed ? "✅ PERMITIDO" : "🚫 BLOQUEADO",
  });
});

