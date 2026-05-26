"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmailDashboardContent } from "@/components/email/email-dashboard-content";
import { EmailViewModeToggle } from "@/components/monitor/email-view-mode-toggle";
import { useMonitorToolbar } from "@/components/monitor/monitor-toolbar-context";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { filterEmailAccounts } from "@/lib/email/email-filters";
import { buildEmailStats } from "@/lib/email/email-stats";
import { hexagonPatternClassName } from "@/lib/hexagons";
import {
  EMAIL_DASHBOARD_REFRESH_INTERVAL_MS,
  useEmailDashboardData,
} from "@/hooks/use-email-dashboard-data";
import { useEmailAlerts } from "@/hooks/use-email-alerts";
import { useEmailMonitorSettings } from "@/hooks/use-email-monitor-settings";
import { useAnimatedHexagons } from "@/hooks/use-animated-hexagons";
import { EmailStatusFilter } from "@/types/email";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export default function CorreosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmailStatusFilter>("all");
  const hexagons = useAnimatedHexagons();
  const {
    accounts,
    lastUpdated,
    error,
    isInitialLoading,
    isRefreshing,
    refresh,
    domainDnsHealth,
  } = useEmailDashboardData();
  const {
    hiddenEmails,
    hideAccount,
    showAccount,
    clearHiddenAccounts,
    viewMode,
    setViewMode,
    isHydrated,
  } = useEmailMonitorSettings();

  const visibleAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => !hiddenEmails.has(normalizeEmail(account.email)),
      ),
    [accounts, hiddenEmails],
  );

  const hiddenAccounts = useMemo(
    () =>
      accounts.filter((account) =>
        hiddenEmails.has(normalizeEmail(account.email)),
      ),
    [accounts, hiddenEmails],
  );

  const visibleStats = useMemo(
    () => buildEmailStats(visibleAccounts),
    [visibleAccounts],
  );

  const filteredAccounts = useMemo(
    () => filterEmailAccounts(visibleAccounts, searchTerm, statusFilter),
    [visibleAccounts, searchTerm, statusFilter],
  );

  useEmailAlerts(isHydrated ? visibleAccounts : []);

  const handleHideAccount = (email: string) => {
    hideAccount(email);
    toast.success("Cuenta omitida", {
      description: `${email} ya no aparecerá en el panel ni en alertas`,
    });
  };

  const handleRestoreAccount = (email: string) => {
    showAccount(email);
    toast.success("Cuenta restaurada", {
      description: `${email} vuelve a mostrarse en el panel`,
    });
  };

  const handleClearHiddenAccounts = () => {
    clearHiddenAccounts();
    toast.success("Todas las cuentas omitidas fueron restauradas");
  };

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      toast.success("Panel de correos actualizado");
    } catch {
      toast.error("No se pudo actualizar el panel de correos");
    }
  }, [refresh]);

  const meta = useMemo(() => {
    const parts: string[] = [];
    if (lastUpdated) {
      parts.push(
        `Actualizado: ${format(new Date(lastUpdated), "HH:mm:ss")}`,
      );
    }
    if (hiddenAccounts.length > 0) {
      parts.push(`${hiddenAccounts.length} omitida(s)`);
    }
    return parts.length > 0 ? parts.join(" · ") : undefined;
  }, [lastUpdated, hiddenAccounts.length]);

  const actionsSlot = useMemo(
    () => (
      <EmailViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
    ),
    [viewMode, setViewMode],
  );

  useMonitorToolbar({
    searchPlaceholder: "Buscar correo...",
    searchTerm,
    onSearchChange: setSearchTerm,
    isRefreshing,
    onRefresh: handleRefresh,
    meta,
    actionsSlot,
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <HexagonPattern hexagons={hexagons} className={hexagonPatternClassName} />
      <main className="relative min-h-0 flex-1">
        <EmailDashboardContent
          accounts={filteredAccounts}
          hiddenAccounts={hiddenAccounts}
          stats={visibleStats}
          isLoading={isInitialLoading || !isHydrated}
          error={error instanceof Error ? error : null}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          viewMode={viewMode}
          refreshIntervalMs={EMAIL_DASHBOARD_REFRESH_INTERVAL_MS}
          onStatusFilterChange={setStatusFilter}
          onHideAccount={handleHideAccount}
          onRestoreAccount={handleRestoreAccount}
          onClearHiddenAccounts={handleClearHiddenAccounts}
          onRetry={handleRefresh}
          domainDnsHealth={domainDnsHealth}
        />
      </main>
    </div>
  );
}
