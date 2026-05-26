import { NextRequest } from "next/server";

export function normalizeIp(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  if (first.startsWith("::ffff:")) return first.slice(7);

  const ipv4WithPort = first.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) return ipv4WithPort[1];

  return first;
}

export function getClientIp(request: NextRequest): string | null {
  const candidate =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for");

  return normalizeIp(candidate);
}

function getAllowedIps(): string[] {
  const raw = process.env.EMAIL_MONITOR_ALLOWED_IPS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function isLocalhostIp(clientIp: string): boolean {
  return clientIp === "127.0.0.1" || clientIp === "::1";
}

export function isEmailMonitorProtectedRoute(pathname: string): boolean {
  if (pathname === "/correos" || pathname.startsWith("/correos/")) return true;
  if (pathname === "/api/emails") return true;
  return false;
}

export function isEmailMonitorIpAllowed(clientIp: string | null): boolean {
  const allowedIps = getAllowedIps();

  if (process.env.NODE_ENV === "development") {
    if (clientIp && isLocalhostIp(clientIp)) return true;
  }

  if (!clientIp || allowedIps.length === 0) return false;

  return allowedIps.includes(clientIp);
}
