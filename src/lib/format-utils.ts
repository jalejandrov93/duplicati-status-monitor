function getDecimalPrecision(value: number): number {
  const absoluteValue = Math.abs(value);
  if (absoluteValue < 10) return 2;
  if (absoluteValue < 100) return 1;
  return 0;
}

export function parseDurationToMinutes(duration: string): number {
  if (!duration || typeof duration !== "string") return 0;
  const parts = duration.split(":");
  if (parts.length !== 3) return 0;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  const seconds = Number(parts[2]);

  if (![hours, minutes, seconds].every(Number.isFinite)) return 0;
  if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return 0;
  return Math.max(0, hours * 60 + minutes + seconds / 60);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDurationFromMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0 min";

  if (totalMinutes < 1) {
    return `${Math.max(1, Math.round(totalMinutes * 60))} s`;
  }

  if (totalMinutes < 60) {
    const totalSeconds = Math.round(totalMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes >= 10 || seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds} s`;
  }

  if (totalMinutes < 1440) {
    const roundedMinutes = Math.round(totalMinutes);
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }

  const roundedMinutes = Math.round(totalMinutes);
  const days = Math.floor(roundedMinutes / 1440);
  const hours = Math.floor((roundedMinutes % 1440) / 60);
  if (hours === 0) return `${days} d`;
  return `${days} d ${hours} h`;
}

export function formatSizeFromMB(sizeMB: number): string {
  if (!Number.isFinite(sizeMB) || sizeMB <= 0) return "0 MB";

  let value = sizeMB;
  let unit = "MB";

  if (Math.abs(sizeMB) >= 1024 * 1024) {
    value = sizeMB / (1024 * 1024);
    unit = "TB";
  } else if (Math.abs(sizeMB) >= 1024) {
    value = sizeMB / 1024;
    unit = "GB";
  }

  const decimals = getDecimalPrecision(value);
  const formattedValue = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDuration(duration: string): string {
  return formatDurationFromMinutes(parseDurationToMinutes(duration));
}
