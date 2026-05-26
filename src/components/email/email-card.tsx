"use client";

import { useState } from "react";
import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { Mail, HardDrive, EyeOff, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { OutlookConfigModal } from "@/components/email/outlook-config-modal";
import {
  EmailStatusBadge,
  getEmailStatusConfig,
} from "@/components/email/email-status-badge";

interface EmailCardProps {
  account: EmailAccountQuota;
  index: number;
  onHideAccount: (email: string) => void;
}

export function EmailCard({ account, index, onHideAccount }: EmailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusConfig = getEmailStatusConfig(account.status);
  const quotaValue = account.usagePercent ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full border-none"
    >
      <div className="group relative h-full w-full transition-all duration-300 ease-out">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "border-2 transition-all duration-500",
            account.status === "SUCCESS"
              ? "border-green-500 shadow-green-500"
              : account.status === "WARNING"
                ? "border-yellow-500 shadow-yellow-500"
                : "border-red-500 shadow-red-500",
            "bg-card shadow hover:shadow-lg",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            onClick={() => onHideAccount(account.email)}
            aria-label={`Omitir cuenta ${account.email}`}
            title="Omitir cuenta"
          >
            <EyeOff className="h-4 w-4" />
          </Button>

          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100",
              "transition-opacity duration-500",
              "bg-gradient-to-br from-transparent via-transparent to-current/5",
              statusConfig.iconColor,
            )}
          />

          <div className="relative space-y-3 p-5">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={cn(
                    "relative shrink-0",
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    account.status === "SUCCESS"
                      ? "border-green-500 bg-green-500/5"
                      : account.status === "WARNING"
                        ? "border-yellow-500 bg-yellow-500/5"
                        : "border-red-500 bg-red-500/5",
                    "border-2 shadow",
                  )}
                >
                  <Mail className={cn("h-6 w-6", statusConfig.iconColor)} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {account.email}
                  </p>
                  <EmailStatusBadge status={account.status} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-muted/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5" />
                  Uso de cuota
                </span>
                <span className="font-medium text-foreground">
                  {account.isUnlimited
                    ? "Ilimitada"
                    : `${quotaValue.toFixed(1)}%`}
                </span>
              </div>

              {!account.isUnlimited && (
                <Progress value={quotaValue} max={100} className="h-2" />
              )}

              <p className="text-xs text-muted-foreground">
                {formatBytes(account.usedBytes)} usados
                {!account.isUnlimited && account.quotaBytes
                  ? ` de ${formatBytes(account.quotaBytes)}`
                  : " · Cuota ilimitada"}
              </p>
            </div>

            {/* Health and Restrictions */}
            <div className="space-y-2 px-5 pb-3">
              {account.healthScore !== undefined && (
                <div className="hidden items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    Salud
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      account.healthStatus === "excellent" && "text-green-500",
                      account.healthStatus === "good" && "text-green-400",
                      account.healthStatus === "warning" && "text-yellow-500",
                      account.healthStatus === "critical" && "text-red-500 animate-pulse",
                    )}
                  >
                    {account.healthScore}/100
                  </span>
                </div>
              )}

              {(account.suspendedOutgoing ||
                account.suspendedIncoming ||
                account.suspendedLogin) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {account.suspendedOutgoing && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25">
                      <ShieldAlert className="h-3 w-3" /> Envío bloqueado
                    </span>
                  )}
                  {account.suspendedIncoming && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25">
                      <ShieldAlert className="h-3 w-3" /> Recepción bloqueada
                    </span>
                  )}
                  {account.suspendedLogin && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25">
                      <ShieldAlert className="h-3 w-3" /> Login bloqueado
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-5 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold rounded-2xl border bg-muted/20 hover:bg-muted/40"
                onClick={() => setIsModalOpen(true)}
              >
                Configurar Outlook
              </Button>
            </div>
          </div>
        </div>
      </div>

      <OutlookConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={account.email}
      />
    </motion.div>
  );
}
