import { useState } from "react";
import { EmailAccountQuota } from "@/types/email";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { EyeOff, Settings, ShieldAlert, MoreVertical } from "lucide-react";
import {
  EmailStatusBadge,
  getEmailStatusConfig,
} from "@/components/email/email-status-badge";
import { OutlookConfigModal } from "@/components/email/outlook-config-modal";
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
          "grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_120px_100px_160px_140px_80px] md:items-center md:gap-4",
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold cursor-help">
                      Salud: {account.healthScore}/100
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-[280px] p-3 border bg-popover text-popover-foreground shadow-lg rounded-xl z-50">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "font-bold cursor-help underline decoration-dotted decoration-muted-foreground/50",
                      account.healthStatus === "excellent" && "text-green-500",
                      account.healthStatus === "good" && "text-green-400",
                      account.healthStatus === "warning" && "text-yellow-500",
                      account.healthStatus === "critical" &&
                        "text-red-500 animate-pulse",
                    )}
                  >
                    {account.healthScore}/100
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="max-w-[280px] p-3 border bg-popover text-popover-foreground shadow-lg rounded-xl z-50">
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

        {/* Acciones Column */}
        <div className="flex justify-end pr-2">
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
      <div className="hidden grid-cols-[minmax(0,2fr)_120px_100px_160px_140px_80px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Cuenta</span>
        <span>Estado</span>
        <span>Salud</span>
        <span>Uso</span>
        <span>Espacio</span>
        <span className="text-right pr-4">Acciones</span>
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
