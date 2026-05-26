import { useState } from "react";
import { DnsHealthResult } from "@/lib/email/dns-health";
import {
  ShieldCheck,
  ShieldAlert,
  ServerCrash,
  Server,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DomainHealthWidgetProps {
  dnsHealth: DnsHealthResult | undefined;
}

export function DomainHealthWidget({ dnsHealth }: DomainHealthWidgetProps) {
  const [showBlacklistDetails, setShowBlacklistDetails] = useState(false);

  if (!dnsHealth) return null;

  const isDnsOk =
    dnsHealth.spf.valid && dnsHealth.dkim.valid && dnsHealth.dmarc.valid;
  const isBlacklistOk = !dnsHealth.blacklist.listed;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg transition-all duration-300">
      {/* Background Glow */}
      <div
        className={cn(
          "absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-10 transition-colors duration-500",
          isDnsOk && isBlacklistOk
            ? "bg-green-500"
            : !isBlacklistOk
              ? "bg-red-500"
              : "bg-yellow-500",
        )}
      />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border-2 bg-muted/40",
                isDnsOk && isBlacklistOk ? "border-green-500" : "border-yellow-500",
              )}
            >
              <Activity
                className={cn(
                  "h-5 w-5 animate-pulse",
                  isDnsOk && isBlacklistOk ? "text-green-500" : "text-yellow-500",
                )}
              />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">
                Auditoría y Seguridad del Dominio
              </h4>
              <p className="text-xs text-muted-foreground">
                Estado DNS y reputación en listas negras
              </p>
            </div>
          </div>
        </div>

        {/* DNS Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* SPF */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all",
              dnsHealth.spf.valid
                ? "border-green-500/20 bg-green-500/5 text-green-500"
                : "border-red-500/20 bg-red-500/5 text-red-500",
            )}
          >
            {dnsHealth.spf.valid ? (
              <ShieldCheck className="mb-1 h-5 w-5" />
            ) : (
              <ShieldAlert className="mb-1 h-5 w-5" />
            )}
            <span className="text-[11px] font-bold">SPF</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-full">
              {dnsHealth.spf.valid ? "Configurado" : "Falta SPF"}
            </span>
          </div>

          {/* DKIM */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all",
              dnsHealth.dkim.valid
                ? "border-green-500/20 bg-green-500/5 text-green-500"
                : "border-red-500/20 bg-red-500/5 text-red-500",
            )}
          >
            {dnsHealth.dkim.valid ? (
              <ShieldCheck className="mb-1 h-5 w-5" />
            ) : (
              <ShieldAlert className="mb-1 h-5 w-5" />
            )}
            <span className="text-[11px] font-bold">DKIM</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-full">
              {dnsHealth.dkim.valid
                ? `Selector: ${dnsHealth.dkim.selector}`
                : "Falta DKIM"}
            </span>
          </div>

          {/* DMARC */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all",
              dnsHealth.dmarc.valid
                ? "border-green-500/20 bg-green-500/5 text-green-500"
                : "border-red-500/20 bg-red-500/5 text-red-500",
            )}
          >
            {dnsHealth.dmarc.valid ? (
              <ShieldCheck className="mb-1 h-5 w-5" />
            ) : (
              <ShieldAlert className="mb-1 h-5 w-5" />
            )}
            <span className="text-[11px] font-bold">DMARC</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-full">
              {dnsHealth.dmarc.valid ? "Configurado" : "Falta DMARC"}
            </span>
          </div>
        </div>

        {/* Blacklist Status */}
        <div
          className={cn(
            "rounded-2xl border p-4 transition-all",
            isBlacklistOk
              ? "border-green-500/25 bg-green-500/5 text-green-500"
              : "border-red-500/25 bg-red-500/5 text-red-500",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isBlacklistOk ? (
                <Server className="h-5 w-5" />
              ) : (
                <ServerCrash className="h-5 w-5 animate-bounce" />
              )}
              <div className="text-left">
                <span className="block text-xs font-bold uppercase tracking-wide">
                  Monitoreo de Blacklists (DNSBL)
                </span>
                <span className="text-xs text-muted-foreground">
                  {isBlacklistOk
                    ? "El servidor de correo no está en listas negras"
                    : "¡ALERTA! Detectado en listas negras de Spam"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-current hover:bg-current/10"
              onClick={() => setShowBlacklistDetails(!showBlacklistDetails)}
            >
              {showBlacklistDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {showBlacklistDetails && dnsHealth.blacklist.details.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-current/10 pt-3 text-xs">
              {dnsHealth.blacklist.details.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-0.5"
                >
                  <span className="font-mono text-muted-foreground">
                    {check.dnsbl}
                  </span>
                  {check.listed ? (
                    <span className="flex items-center gap-1 font-bold text-red-500">
                      <XCircle className="h-3.5 w-3.5" /> Listado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-green-500">
                      <CheckCircle className="h-3.5 w-3.5" /> Limpio
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
