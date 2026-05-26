import { EmailAccountQuota } from "@/types/email";
import { DnsHealthResult } from "./dns-health";
import { suspendOutgoingEmail } from "./cpanel-actions";

export interface AccountHealth {
  score: number;
  status: "excellent" | "good" | "warning" | "critical";
  reasons: string[];
}

export function calculateAccountHealth(
  account: EmailAccountQuota,
  dnsHealth: DnsHealthResult,
): AccountHealth {
  let score = 100;
  const reasons: string[] = [];

  // 1. Evaluar restricciones de UAPI (Hard overrides)
  if (account.suspendedOutgoing) {
    reasons.push("Envío de correos suspendido (Posible cuenta comprometida)");
    return { score: 0, status: "critical", reasons };
  }
  if (account.suspendedLogin) {
    reasons.push("Login de cuenta suspendido");
    return { score: 10, status: "critical", reasons };
  }
  if (account.suspendedIncoming) {
    reasons.push("Recepción de correos suspendida");
    return { score: 10, status: "critical", reasons };
  }

  // 2. Evaluar uso de cuota
  if (!account.isUnlimited && account.usagePercent !== null) {
    if (account.usagePercent >= 95) {
      score -= 40;
      reasons.push(
        `Espacio en disco crítico (${account.usagePercent.toFixed(1)}%)`,
      );
    } else if (account.usagePercent >= 85) {
      score -= 20;
      reasons.push(
        `Espacio en disco bajo (${account.usagePercent.toFixed(1)}%)`,
      );
    } else if (account.usagePercent >= 70) {
      score -= 10;
      reasons.push(
        `Espacio en disco moderado (${account.usagePercent.toFixed(1)}%)`,
      );
    }
  }

  // 3. Evaluar reputación de dominio y configuración DNS
  if (dnsHealth.blacklist.listed) {
    score -= 40;
    reasons.push(
      "El servidor de correo del dominio está en listas negras (DNSBL)",
    );
  }
  if (!dnsHealth.spf.valid) {
    score -= 15;
    reasons.push("Falta registro SPF o es inválido");
  }
  if (!dnsHealth.dkim.valid) {
    score -= 15;
    reasons.push("Falta firma DKIM en selectores comunes");
  }
  if (!dnsHealth.dmarc.valid) {
    score -= 10;
    reasons.push("Falta política DMARC");
  }

  score = Math.max(0, Math.min(100, score));

  let status: "excellent" | "good" | "warning" | "critical" = "excellent";
  if (score < 40) {
    status = "critical";
  } else if (score < 70) {
    status = "warning";
  } else if (score < 85) {
    status = "good";
  }

  return { score, status, reasons };
}

/**
 * Heurística de suspensión automática preventiva.
 */
export async function evaluateAndSuspendIfCritical(
  account: EmailAccountQuota,
  health: AccountHealth,
): Promise<{ suspended: boolean; reason?: string }> {
  if (account.suspendedOutgoing) {
    return { suspended: false, reason: "Ya suspendida" };
  }

  const isQuotaExtreme =
    !account.isUnlimited &&
    account.usagePercent !== null &&
    account.usagePercent >= 99;
  const isHighSpamRisk =
    health.score < 30 &&
    health.reasons.some((r) => r.includes("listas negras"));

  if (isQuotaExtreme || isHighSpamRisk) {
    const reason = isQuotaExtreme
      ? "Suspensión automática preventiva por espacio agotado (99%+)"
      : "Suspensión automática preventiva por alto riesgo de spam y reputación crítica";

    const success = await suspendOutgoingEmail(account.email);
    if (success) {
      return { suspended: true, reason };
    }
  }

  return { suspended: false };
}
