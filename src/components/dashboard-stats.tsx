"use client";

import { Server, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { GlobalStats } from "@/types/backup";

interface DashboardStatsProps {
    stats: GlobalStats | undefined;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    if (!stats) return null;

    return (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 z-10">
            {/* Total Machines */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-100 dark:bg-blue-900/80 p-4 text-card-foreground shadow-sm">
                <div className="shrink-0 p-2 rounded-lg ">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.totalMachines}</p>
                </div>
            </div>

            {/* Successful */}
            <div className="flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-green-100 dark:bg-green-900/80 shadow-sm">
                <div className="shrink-0 p-2 rounded-lg ">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Exitosas</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.successfulMachines}
                        </p>
                    </div>
                </div>
            </div>

            {/* Warnings */}
            <div className="flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-yellow-100 dark:bg-yellow-900/80 shadow-sm">
                <div className="shrink-0 p-2 rounded-lg ">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Advertencias</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.warningMachines}
                        </p>
                    </div>
                </div>
            </div>

            {/* Errors */}
            <div className="flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-red-100 dark:bg-red-900/80 shadow-sm">
                <div className="shrink-0 p-2 rounded-lg ">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Errores</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.errorMachines}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
