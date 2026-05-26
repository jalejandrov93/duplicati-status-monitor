import { useQuery } from "@tanstack/react-query";
import type { MachineDetailData } from "@/types/machine";
import { fetchApi } from "@/lib/fetch-api";

function fetchMachineDetails(
    machineName: string
): Promise<MachineDetailData> {
    return fetchApi<MachineDetailData>(`/api/machines/${encodeURIComponent(machineName)}`);
}

export function useMachineDetails(machineName: string) {
    return useQuery({
        queryKey: ["machine", machineName],
        queryFn: () => fetchMachineDetails(machineName),
        staleTime: 15000,
        refetchInterval: 30000,
    });
}
