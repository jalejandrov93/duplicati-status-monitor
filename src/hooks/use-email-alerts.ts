import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { EmailAccountQuota } from "@/types/email";

export function useEmailAlerts(accounts: EmailAccountQuota[]) {
  const hasShownNotificationsRef = useRef(false);

  useEffect(() => {
    if (accounts.length === 0 || hasShownNotificationsRef.current) return;

    const errorAccounts = accounts.filter((account) => account.status === "ERROR");
    const warningAccounts = accounts.filter(
      (account) => account.status === "WARNING",
    );

    if (errorAccounts.length > 0) {
      toast.error(
        `Crítico: ${errorAccounts.length} cuenta(s) cerca del límite de cuota`,
        {
          description: errorAccounts.map((account) => account.email).join(", "),
          duration: 10000,
        },
      );
    }

    if (warningAccounts.length > 0) {
      toast.warning(
        `${warningAccounts.length} cuenta(s) con advertencia de cuota`,
        {
          description: warningAccounts
            .map((account) => account.email)
            .join(", "),
          duration: 5000,
        },
      );
    }

    hasShownNotificationsRef.current = true;
  }, [accounts]);
}
