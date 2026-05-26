"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import {
  EmailAccountQuota,
  EmailStats,
  EmailStatusFilter,
} from "@/types/email";
import { EmailCard } from "@/components/email/email-card";
import { EmailListView } from "@/components/email/email-list-view";
import { EmailDashboardStats } from "@/components/email/email-dashboard-stats";
import { EmailHiddenPanel } from "@/components/email/email-hidden-panel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailViewMode } from "@/hooks/use-email-monitor-settings";

interface EmailDashboardContentProps {
  accounts: EmailAccountQuota[];
  hiddenAccounts: EmailAccountQuota[];
  stats?: EmailStats;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  statusFilter: EmailStatusFilter;
  viewMode: EmailViewMode;
  refreshIntervalMs: number;
  onStatusFilterChange: (filter: EmailStatusFilter) => void;
  onHideAccount: (email: string) => void;
  onRestoreAccount: (email: string) => void;
  onClearHiddenAccounts: () => void;
  onRetry: () => void | Promise<void>;
}

function EmailLoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmailErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="text-lg font-semibold">
        No se pudieron cargar las cuotas de correo
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
      <Button className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function EmailEmptyState({
  searchTerm,
  showClearFilter,
  hasHiddenAccounts,
  onClearFilter,
}: {
  searchTerm: string;
  showClearFilter: boolean;
  hasHiddenAccounts: boolean;
  onClearFilter: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No se encontraron cuentas</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {searchTerm
          ? "Intenta ajustar tus términos de búsqueda"
          : hasHiddenAccounts
            ? "Todas las cuentas visibles están omitidas o no hay cuentas en cPanel"
            : "No hay cuentas de correo registradas en cPanel"}
      </p>
      {showClearFilter && (
        <Button className="mt-4" variant="outline" onClick={onClearFilter}>
          Limpiar filtro
        </Button>
      )}
    </div>
  );
}

export function EmailDashboardContent({
  accounts,
  hiddenAccounts,
  stats,
  isLoading,
  error,
  searchTerm,
  statusFilter,
  viewMode,
  refreshIntervalMs,
  onStatusFilterChange,
  onHideAccount,
  onRestoreAccount,
  onClearHiddenAccounts,
  onRetry,
}: EmailDashboardContentProps) {
  const hasAccounts = accounts.length > 0;

  const content = (() => {
    if (isLoading) return <EmailLoadingState />;
    if (error && !hasAccounts && hiddenAccounts.length === 0) {
      return <EmailErrorState errorMessage={error.message} onRetry={onRetry} />;
    }

    return (
      <>
        <div className="z-20 mb-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span>Actualizando cada {Math.floor(refreshIntervalMs / 1000)}s</span>
        </div>

        <EmailDashboardStats
          stats={stats}
          onFilterClick={onStatusFilterChange}
          activeFilter={statusFilter}
        />

        {!hasAccounts ? (
          <EmailEmptyState
            searchTerm={searchTerm}
            showClearFilter={statusFilter !== "all"}
            hasHiddenAccounts={hiddenAccounts.length > 0}
            onClearFilter={() => onStatusFilterChange("all")}
          />
        ) : viewMode === "list" ? (
          <EmailListView accounts={accounts} onHideAccount={onHideAccount} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((account, index) => (
              <EmailCard
                key={account.email}
                account={account}
                index={index}
                onHideAccount={onHideAccount}
              />
            ))}
          </div>
        )}

        <EmailHiddenPanel
          hiddenAccounts={hiddenAccounts}
          onRestoreAccount={onRestoreAccount}
          onClearAll={onClearHiddenAccounts}
        />
      </>
    );
  })();

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto px-4 py-4 pb-24">{content}</div>
    </ScrollArea>
  );
}
