"use client";

import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { EyeOff } from "lucide-react";
import {
  EmailStatusBadge,
  getEmailStatusConfig,
} from "@/components/email/email-status-badge";

interface EmailListViewProps {
  accounts: EmailAccountQuota[];
  onHideAccount: (email: string) => void;
}

export function EmailListView({ accounts, onHideAccount }: EmailListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
      <div className="hidden grid-cols-[minmax(0,2fr)_120px_160px_140px_48px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Cuenta</span>
        <span>Estado</span>
        <span>Uso</span>
        <span>Espacio</span>
        <span className="sr-only">Acciones</span>
      </div>

      <ul className="divide-y">
        {accounts.map((account) => {
          const statusConfig = getEmailStatusConfig(account.status);
          const quotaValue = account.usagePercent ?? 0;

          return (
            <li
              key={account.email}
              className={cn(
                "grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_120px_160px_140px_48px] md:items-center md:gap-4",
                "border-l-4",
                account.status === "SUCCESS"
                  ? "border-l-green-500"
                  : account.status === "WARNING"
                    ? "border-l-yellow-500"
                    : "border-l-red-500",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {account.email}
                </p>
                <div className="mt-2 md:hidden">
                  <EmailStatusBadge status={account.status} />
                </div>
              </div>

              <div className="hidden md:block">
                <EmailStatusBadge status={account.status} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uso de cuota</span>
                  <span className={cn("font-medium", statusConfig.iconColor)}>
                    {account.isUnlimited
                      ? "Ilimitada"
                      : `${quotaValue.toFixed(1)}%`}
                  </span>
                </div>
                {!account.isUnlimited && (
                  <Progress value={quotaValue} max={100} className="h-2" />
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {formatBytes(account.usedBytes)} usados
                {!account.isUnlimited && account.quotaBytes
                  ? ` de ${formatBytes(account.quotaBytes)}`
                  : " · Cuota ilimitada"}
              </p>

              <div className="flex justify-end md:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onHideAccount(account.email)}
                  aria-label={`Omitir cuenta ${account.email}`}
                  title="Omitir cuenta"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
