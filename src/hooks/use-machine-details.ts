import { useQuery } from "@tanstack/react-query";
import type { MachineDetailData } from "@/types/machine";

async function fetchMachineDetails(
    machineName: string
): Promise<MachineDetailData> {
    const res = await fetch(`/api/machines/${encodeURIComponent(machineName)}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al obtener detalles de la máquina");
    return res.json();
}

export function useMachineDetails(machineName: string) {
    return useQuery({
        queryKey: ["machine", machineName],
        queryFn: () => fetchMachineDetails(machineName),
        staleTime: 15000,
        refetchInterval: 30000,
    });
}
