"use client";

import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";
import { Mail, HardDrive, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
