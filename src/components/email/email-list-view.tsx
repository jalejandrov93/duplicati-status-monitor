import { useState } from "react";
import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { EyeOff, Settings, ShieldAlert } from "lucide-react";
import {
  EmailStatusBadge,
  getEmailStatusConfig,
} from "@/components/email/email-status-badge";
import { OutlookConfigModal } from "@/components/email/outlook-config-modal";

interface EmailListViewProps {
  accounts: EmailAccountQuota[];
  onHideAccount: (email: string) => void;
}

function EmailRow({
  account,
  onHideAccount,
}: {
  account: EmailAccountQuota;
  onHideAccount: (email: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusConfig = getEmailStatusConfig(account.status);
  const quotaValue = account.usagePercent ?? 0;

  return (
    <>
      <li
        className={cn(
          "grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_120px_100px_160px_140px_100px_48px] md:items-center md:gap-4",
          "border-l-4",
          account.status === "SUCCESS"
            ? "border-l-green-500"
            : account.status === "WARNING"
              ? "border-l-yellow-500"
              : "border-l-red-500",
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold flex items-center gap-1.5">
            {account.email}
            {(account.suspendedOutgoing ||
              account.suspendedIncoming ||
              account.suspendedLogin) && (
              <span title="Cuenta Restringida / Comprometida">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 md:hidden">
            <EmailStatusBadge status={account.status} />
            {account.healthScore !== undefined && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                Salud: {account.healthScore}/100
              </span>
            )}
          </div>
        </div>

        {/* Estado Column */}
        <div className="hidden md:block">
          <EmailStatusBadge status={account.status} />
        </div>

        {/* Salud Column */}
        <div className="hidden text-sm md:block">
          {account.healthScore !== undefined ? (
            <span
              className={cn(
                "font-bold",
                account.healthStatus === "excellent" && "text-green-500",
                account.healthStatus === "good" && "text-green-400",
                account.healthStatus === "warning" && "text-yellow-500",
                account.healthStatus === "critical" &&
                  "text-red-500 animate-pulse",
              )}
            >
              {account.healthScore}/100
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>

        {/* Uso Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uso de cuota</span>
            <span className={cn("font-medium", statusConfig.iconColor)}>
              {account.isUnlimited ? "Ilimitada" : `${quotaValue.toFixed(1)}%`}
            </span>
          </div>
          {!account.isUnlimited && (
            <Progress value={quotaValue} max={100} className="h-2" />
          )}
        </div>

        {/* Espacio Column */}
        <p className="text-xs text-muted-foreground">
          {formatBytes(account.usedBytes)} usados
          {!account.isUnlimited && account.quotaBytes
            ? ` de ${formatBytes(account.quotaBytes)}`
            : " · Cuota ilimitada"}
        </p>

        {/* Config Column */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border bg-muted/20 hover:bg-muted/40 rounded-xl text-xs"
            onClick={() => setIsModalOpen(true)}
          >
            <Settings className="h-3 w-3" />
            Config
          </Button>
        </div>

        {/* Acciones Column */}
        <div className="flex justify-end gap-2 md:justify-center">
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setIsModalOpen(true)}
            >
              Config
            </Button>
          </div>
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

      <OutlookConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={account.email}
      />
    </>
  );
}

export function EmailListView({ accounts, onHideAccount }: EmailListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
      <div className="hidden grid-cols-[minmax(0,2fr)_120px_100px_160px_140px_100px_48px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Cuenta</span>
        <span>Estado</span>
        <span>Salud</span>
        <span>Uso</span>
        <span>Espacio</span>
        <span>Config</span>
        <span className="sr-only">Acciones</span>
      </div>

      <ul className="divide-y">
        {accounts.map((account) => (
          <EmailRow
            key={account.email}
            account={account}
            onHideAccount={onHideAccount}
          />
        ))}
      </ul>
    </div>
  );
}
