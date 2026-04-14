"use client";

import { Server, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { GlobalStats } from "@/types/backup";

export type StatusFilter = "all" | "success" | "warning" | "error";

interface DashboardStatsProps {
    stats: GlobalStats | undefined;
    onFilterClick?: (filter: StatusFilter) => void;
    activeFilter?: StatusFilter | null;
}

export function DashboardStats({ stats, onFilterClick, activeFilter }: DashboardStatsProps) {
    if (!stats) return null;

    const handleFilterClick = (filter: StatusFilter) => {
        if (onFilterClick) {
            onFilterClick(filter);
        }
    };

    const isActive = (filter: StatusFilter) => activeFilter === filter;

    return (
        <div className="mb-6 z-10">
            {/* Filter indicator */}
            {activeFilter && activeFilter !== "all" && (
                <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Filtrado por:</span>
                    <span className="font-medium capitalize">{activeFilter === "success" ? "Exitosas" : activeFilter === "warning" ? "Advertencias" : "Errores"}</span>
                    <button
                        onClick={() => handleFilterClick("all")}
                        className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
                        title="Limpiar filtro"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {/* Total Machines */}
                <button
                    onClick={() => handleFilterClick("all")}
                    className={`relative flex items-center gap-3 rounded-xl bg-blue-100 dark:bg-blue-900/80 p-4 text-card-foreground shadow-sm transition-all hover:scale-105 cursor-pointer ${
                        isActive("all") ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                >
                    <div className="shrink-0 p-2 rounded-lg ">
                        <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.totalMachines}</p>
                    </div>
                </button>

                {/* Successful */}
                <button
                    onClick={() => handleFilterClick("success")}
                    className={`relative flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-green-100 dark:bg-green-900/80 shadow-sm transition-all hover:scale-105 cursor-pointer ${
                        isActive("success") ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                >
                    <div className="shrink-0 p-2 rounded-lg ">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Exitosas</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.successfulMachines}
                            </p>
                        </div>
                    </div>
                </button>

                {/* Warnings */}
                <button
                    onClick={() => handleFilterClick("warning")}
                    className={`relative flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-yellow-100 dark:bg-yellow-900/80 shadow-sm transition-all hover:scale-105 cursor-pointer ${
                        isActive("warning") ? "ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                >
                    <div className="shrink-0 p-2 rounded-lg ">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Advertencias</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {stats.warningMachines}
                            </p>
                        </div>
                    </div>
                </button>

                {/* Errors */}
                <button
                    onClick={() => handleFilterClick("error")}
                    className={`relative flex items-center gap-3 rounded-xl p-4 text-card-foreground bg-red-100 dark:bg-red-900/80 shadow-sm transition-all hover:scale-105 cursor-pointer ${
                        isActive("error") ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                >
                    <div className="shrink-0 p-2 rounded-lg ">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Errores</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {stats.errorMachines}
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
