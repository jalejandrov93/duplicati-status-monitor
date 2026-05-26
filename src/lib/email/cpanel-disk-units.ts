const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const BYTES_PER_GB = BYTES_PER_MB * BYTES_PER_KB;
const BYTES_PER_TB = BYTES_PER_GB * BYTES_PER_KB;

const HUMAN_DISK_SIZE_PATTERN =
  /^([\d.,]+)\s*(bytes?|b|kb|mb|gb|tb)$/i;

function normalizeHumanDiskInput(value: string): string {
  return value
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(",", ".")
    .toLowerCase();
}

function parseHumanNumeric(value: string): number | null {
  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function cpanelMegabytesToBytes(mb: number): number {
  if (!Number.isFinite(mb) || mb <= 0) return 0;
  return mb * BYTES_PER_MB;
}

export function parseCpanelHumanDiskSize(value: string): number | null {
  const normalized = normalizeHumanDiskInput(value);
  if (!normalized || normalized === "none" || normalized === "unlimited") {
    return null;
  }

  const match = normalized.match(HUMAN_DISK_SIZE_PATTERN);
  if (!match) return null;

  const amount = parseHumanNumeric(match[1]);
  if (amount === null || amount < 0) return null;

  const unit = match[2].toLowerCase();
  if (unit === "b" || unit.startsWith("byte")) return amount;
  if (unit === "kb") return amount * BYTES_PER_KB;
  if (unit === "mb") return amount * BYTES_PER_MB;
  if (unit === "gb") return amount * BYTES_PER_GB;
  if (unit === "tb") return amount * BYTES_PER_TB;

  return null;
}

export function resolveCpanelDiskBytes(
  numericValue: number,
  humanValue?: string,
): number {
  if (humanValue) {
    const parsedHuman = parseCpanelHumanDiskSize(humanValue);
    if (parsedHuman !== null) return parsedHuman;
  }

  return cpanelMegabytesToBytes(numericValue);
}
