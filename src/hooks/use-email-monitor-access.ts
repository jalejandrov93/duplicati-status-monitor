import { useQuery } from "@tanstack/react-query";

interface EmailAccessResponse {
  hasAccess: boolean;
}

async function fetchEmailMonitorAccess(): Promise<boolean> {
  const response = await fetch("/api/emails/access", { cache: "no-store" });
  if (!response.ok) return false;
  const data = (await response.json()) as EmailAccessResponse;
  return Boolean(data.hasAccess);
}

export function useEmailMonitorAccess() {
  const query = useQuery({
    queryKey: ["email-monitor-access"],
    queryFn: fetchEmailMonitorAccess,
    staleTime: 60_000,
  });

  return {
    hasAccess: query.data ?? false,
    isLoading: query.isLoading,
  };
}
