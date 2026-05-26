"use client";

import { useState } from "react";
import { EmailAccountQuota } from "@/types/email";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmailStatusBadge } from "@/components/email/email-status-badge";

interface EmailHiddenPanelProps {
  hiddenAccounts: EmailAccountQuota[];
  onRestoreAccount: (email: string) => void;
  onClearAll: () => void;
}

export function EmailHiddenPanel({
  hiddenAccounts,
  onRestoreAccount,
  onClearAll,
}: EmailHiddenPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (hiddenAccounts.length === 0) return null;

  return (
    <section className="mt-8 rounded-xl border border-dashed bg-muted/20">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-sm font-medium">Cuentas omitidas</p>
          <p className="text-xs text-muted-foreground">
            {hiddenAccounts.length} cuenta(s) excluidas del panel y las alertas
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t px-4 py-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Restaurar todas
            </Button>
          </div>

          <ul className="space-y-2">
            {hiddenAccounts.map((account) => (
              <li
                key={account.email}
                className="flex flex-col gap-3 rounded-lg border bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {account.email}
                  </p>
                  <div className="mt-1">
                    <EmailStatusBadge status={account.status} />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRestoreAccount(account.email)}
                  className="gap-2 self-start sm:self-auto"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Mostrar de nuevo
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
