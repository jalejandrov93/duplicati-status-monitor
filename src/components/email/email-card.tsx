"use client";

import { useState } from "react";
import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { Mail, HardDrive, EyeOff, Activity, ShieldAlert, MoreVertical, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { OutlookConfigModal } from "@/components/email/outlook-config-modal";
import {
  EmailStatusBadge,
  getEmailStatusConfig,
} from "@/components/email/email-status-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
              ? "border-green-500 shadow-green-500/10"
              : account.status === "WARNING"
                ? "border-yellow-500 shadow-yellow-500/10"
                : "border-red-500 shadow-red-500/10",
            "bg-card shadow hover:shadow-lg",
          )}
        >
          <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity duration-300">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted/80"
                  aria-label={`Acciones para ${account.email}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-card p-1 shadow-md z-50">
                <DropdownMenuItem
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer gap-2 rounded-lg text-xs font-medium hover:bg-muted"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configurar Outlook
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onHideAccount(account.email)}
                  className="cursor-pointer gap-2 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Omitir cuenta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    Salud
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "font-bold cursor-help underline decoration-dotted decoration-muted-foreground/50",
                            account.healthStatus === "excellent" && "text-green-500",
                            account.healthStatus === "good" && "text-green-400",
                            account.healthStatus === "warning" && "text-yellow-500",
                            account.healthStatus === "critical" && "text-red-500 animate-pulse",
                          )}
                        >
                          {account.healthScore}/100
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end" className="max-w-[280px] p-3 border bg-popover text-popover-foreground shadow-lg rounded-xl z-50">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-xs">
                            Estado: <span className="capitalize">{account.healthStatus}</span>
                          </p>
                          {account.healthReasons && account.healthReasons.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-muted-foreground">
                              {account.healthReasons.map((reason, idx) => (
                                <li key={idx} className="leading-tight">{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-muted-foreground leading-tight">
                              La cuenta está en excelente estado. No se detectan problemas de DNS, spam o almacenamiento.
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {(account.suspendedOutgoing ||
                account.suspendedIncoming ||
                account.suspendedLogin) && (
                <div className="flex flex-row gap-1.5 pt-1">
                  {account.suspendedOutgoing && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25 truncate">
                      <ShieldAlert className="h-3 w-3" /> Envío bloqueado
                    </span>
                  )}
                  {account.suspendedIncoming && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25 truncate">
                      <ShieldAlert className="h-3 w-3" /> Recepción bloqueada
                    </span>
                  )}
                  {account.suspendedLogin && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/25 truncate">
                      <ShieldAlert className="h-3 w-3" /> Login bloqueado
                    </span>
                  )}
                </div>
              )}
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
