interface CpanelConfig {
  host: string;
  port: number;
  username: string;
  apiToken: string;
  domain?: string;
}

interface CpanelEmailRaw {
  email?: string;
  login?: string;
  diskused?: number | string;
  diskquota?: number | string;
  diskusedpercent?: number | string;
  humandiskused?: string;
  humandiskquota?: string;
}

interface CpanelUapiResponse {
  status?: number;
  errors?: string[] | null;
  data?: CpanelEmailRaw[];
  metadata?: {
    result?: number;
    reason?: string | null;
  };
}

let cachedAccounts: CpanelEmailRaw[] | null = null;
let cacheExpiresAt = 0;

function getCacheTtlMs(): number {
  const raw = process.env.EMAIL_CACHE_TTL_SECONDS;
  const seconds = raw ? Number.parseInt(raw, 10) : 120;
  if (!Number.isFinite(seconds) || seconds <= 0) return 120_000;
  return seconds * 1000;
}

export function isCpanelConfigured(): boolean {
  return Boolean(
    process.env.CPANEL_HOST &&
      process.env.CPANEL_USERNAME &&
      process.env.CPANEL_API_TOKEN,
  );
}

function getCpanelConfig(): CpanelConfig {
  const host = process.env.CPANEL_HOST?.trim();
  const username = process.env.CPANEL_USERNAME?.trim();
  const apiToken = process.env.CPANEL_API_TOKEN?.trim();
  const domain = process.env.CPANEL_DOMAIN?.trim();

  if (!host || !username || !apiToken) {
    throw new Error("CPANEL_NOT_CONFIGURED");
  }

  const portRaw = process.env.CPANEL_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 2083;

  return {
    host,
    port: Number.isFinite(port) ? port : 2083,
    username,
    apiToken,
    domain: domain || undefined,
  };
}

function parseNumericValue(value: number | string | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "unlimited" || normalized === "none" || normalized === "") {
      return 0;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isUnlimitedQuota(value: number | string | undefined): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "unlimited" || normalized === "none" || normalized === "";
  }
  return false;
}

function normalizeEmailAccount(raw: CpanelEmailRaw): CpanelEmailRaw {
  const email = raw.email || raw.login || "";
  const unlimited = isUnlimitedQuota(raw.diskquota ?? raw.humandiskquota);
  const diskused = parseNumericValue(raw.diskused);
  const diskquota = unlimited ? 0 : parseNumericValue(raw.diskquota);
  const diskusedpercent = unlimited
    ? 0
    : parseNumericValue(raw.diskusedpercent);

  return {
    email,
    login: email,
    diskused,
    diskquota: unlimited ? "unlimited" : diskquota,
    diskusedpercent,
    humandiskused: raw.humandiskused,
    humandiskquota: raw.humandiskquota,
  };
}

export async function fetchCpanelEmailAccounts(): Promise<CpanelEmailRaw[]> {
  const now = Date.now();
  if (cachedAccounts && cacheExpiresAt > now) {
    return cachedAccounts;
  }

  const config = getCpanelConfig();
  const url = new URL(
    `https://${config.host}:${config.port}/execute/Email/list_pops_with_disk`,
  );

  if (config.domain) {
    url.searchParams.set("domain", config.domain);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `cpanel ${config.username}:${config.apiToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Error HTTP al consultar cPanel:", response.status);
    throw new Error("CPANEL_REQUEST_FAILED");
  }

  const payload = (await response.json()) as CpanelUapiResponse;
  const isSuccess =
    payload.status === 1 || payload.metadata?.result === 1;

  if (!isSuccess) {
    console.error(
      "Error UAPI cPanel:",
      payload.errors?.join(", ") || payload.metadata?.reason || "unknown",
    );
    throw new Error("CPANEL_UAPI_ERROR");
  }

  const accounts = (payload.data ?? [])
    .map(normalizeEmailAccount)
    .filter((account) => Boolean(account.email));

  cachedAccounts = accounts;
  cacheExpiresAt = now + getCacheTtlMs();

  return accounts;
}

export function clearCpanelEmailCache(): void {
  cachedAccounts = null;
  cacheExpiresAt = 0;
}
