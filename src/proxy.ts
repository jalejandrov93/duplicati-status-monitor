import { NextRequest, NextResponse } from "next/server";
import maxmind, { type Reader, type Response } from "maxmind";
import { promises as fs } from "fs";

type GeoLiteCountry = Response & {
  country?: {
    iso_code?: string | null;
  } | null;
};

let readerPromise: Promise<Reader<GeoLiteCountry>> | null = null;
const DEFAULT_ALLOWED_COUNTRIES = ["CO"];

function getAllowedCountries(): string[] {
  const raw = process.env.ALLOWED_COUNTRIES;
  if (!raw) return DEFAULT_ALLOWED_COUNTRIES;
  const parsed = raw.split(",").map((code) => code.trim().toUpperCase()).filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_COUNTRIES;
}

async function getReader(): Promise<Reader<GeoLiteCountry> | null> {
  const dbPath = process.env.GEOIP_DB_PATH;
  if (!dbPath) {
    console.warn("GEOIP_DB_PATH no está configurado. Se omite validación MaxMind.");
    return null;
  }

  if (!readerPromise) {
    try {
      await fs.access(dbPath);
      readerPromise = maxmind.open<GeoLiteCountry>(dbPath);
    } catch (e) {
      console.error(`Error abriendo maxmind DB en ${dbPath}:`, e);
      return null;
    }
  }
  return readerPromise;
}

function shouldBypass(pathname: string): boolean {
  if (pathname.startsWith("/api/geo/allow")) return true;
  if (pathname.startsWith("/blocked")) return true; // Bypass UI bloqueo
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  return false;
}

function normalizeIp(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  if (first.startsWith("::ffff:")) return first.slice(7);

  const ipv4WithPort = first.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) return ipv4WithPort[1];

  return first;
}

function getClientIp(request: NextRequest): string | null {
  const candidate =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for");

  return normalizeIp(candidate);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const rewriteUrl = new URL("/blocked", request.url);

  // --- MODO DESARROLLADOR: SIMULADOR DE BLOQUEO ---
  // Si estamos en desarrollo, podemos simular un bloqueo usando un query param ?simulate_block=true
  if (process.env.NODE_ENV === "development" && request.nextUrl.searchParams.get("simulate_block") === "true") {
    console.log("🛠 [Dev Mode] Simulando IP de país bloqueado...");
    return NextResponse.rewrite(rewriteUrl);
  }

  const clientIp = getClientIp(request);
  
  // En producción, si no detectamos IP (raro tras reverse proxy), bloqueamos por precaución.
  if (!clientIp && process.env.NODE_ENV === "production") {
    return NextResponse.rewrite(rewriteUrl);
  }

  const reader = await getReader();
  if (!reader) {
    // Si no hay lector (ej. falta db), pasamos en local, pero en prod bloqueamos.
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ ALERTA: Base de datos MaxMind no encontrada en Producción. Bloqueando por seguridad.");
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  if (clientIp) {
    try {
      // Ignorar localhost para que no bloquee el desarrollo
      if (clientIp === "::1" || clientIp === "127.0.0.1") {
        console.log("🛠 [Dev] IP local detectada (localhost). Permitiendo acceso por defecto.");
        return NextResponse.next();
      }

      const geo = reader.get(clientIp);
      const countryCode = geo?.country?.iso_code?.toUpperCase();

      console.log(`🌍 [GeoIP Debug] IP: ${clientIp} -> País detectado: ${countryCode || "Desconocido"}`);

      if (!countryCode) {
        console.log(`🚫 Bloqueado: No se pudo determinar el país para la IP ${clientIp}`);
        return NextResponse.rewrite(rewriteUrl);
      }

      const allowedCountries = getAllowedCountries();
      const allowed = allowedCountries.includes(countryCode);
      
      if (!allowed) {
        console.log(`🚫 Bloqueado: País ${countryCode} no está en la lista de permitidos (${allowedCountries.join(",")})`);
        return NextResponse.rewrite(rewriteUrl);
      }
      
      console.log(`✅ Permitido: País ${countryCode} autorizado.`);
    } catch (error) {
      console.error("Error validando IP con MaxMind:", error);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};

export default proxy;
