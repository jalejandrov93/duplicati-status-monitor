"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertCircle,
    AlertTriangle,
    Database,
    FileX,
    Lock,
    Key,
    Clock,
    WifiOff,
    HardDrive,
    HelpCircle,
    Terminal,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/animation-variants";
import { parseDuplicatiError, getErrorTypeConfig, formatMissingFilesList } from "@/lib/error-parser";
import { RecommendationsPanel } from "./recommendations-panel";
import type { LatestBackup } from "@/types/machine";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof AlertCircle> = {
    database: Database,
    "file-x": FileX,
    lock: Lock,
    key: Key,
    clock: Clock,
    "wifi-off": WifiOff,
    "hard-drive": HardDrive,
    "alert-circle": HelpCircle,
};

export interface ErrorDetailsProps {
    latestBackup: LatestBackup;
}

export const MachineErrorDetails = memo(function MachineErrorDetails({
    latestBackup,
}: ErrorDetailsProps) {
    if (!latestBackup.HasErrors || !latestBackup.Exception) return null;

    // Parsear el error
    const parsedError = parseDuplicatiError(latestBackup.Exception, latestBackup.LogLines);
    const errorConfig = getErrorTypeConfig(parsedError.errorType);

    // Obtener el icono según el tipo de error
    const IconComponent = iconMap[errorConfig.icon] || HelpCircle;

    // Formatear lista de archivos faltantes
    const missingFilesFormatted = parsedError.missingFiles && parsedError.missingFiles.length > 0
        ? formatMissingFilesList(parsedError.missingFiles, 15)
        : null;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
        >
            <Card className={cn(
                "mb-8 overflow-hidden",
                errorConfig.borderColor,
                errorConfig.bgColor
            )}>
                {/* Header con color según tipo de error */}
                <div className={cn(
                    "px-6 py-4 border-b",
                    errorConfig.borderColor,
                    errorConfig.bgColor
                )}>
                    <CardHeader className="p-0 flex flex-row items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            errorConfig.bgColor,
                            "border",
                            errorConfig.borderColor
                        )}>
                            <IconComponent className={cn("w-6 h-6", errorConfig.iconColor)} />
                        </div>
                        <div className="flex-1">
                            <CardTitle className={cn("text-lg", errorConfig.iconColor)}>
                                {parsedError.errorTitle}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {parsedError.errorDescription}
                            </p>
                        </div>
                        {/* Badge del tipo de error */}
                        <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            errorConfig.badgeColor
                        )}>
                            {parsedError.errorType.replace(/_/g, " ")}
                        </span>
                    </CardHeader>
                </div>

                <CardContent className="p-6 space-y-6">
                    {/* Panel de recomendaciones con tabs GUI / CLI */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                            <Terminal className={cn("w-4 h-4", errorConfig.iconColor)} />
                            Cómo resolver este error
                        </h4>
                        <RecommendationsPanel parsedError={parsedError} />
                    </div>

                    {/* Mostrar advertencia si hay archivos faltantes */}
                    {parsedError.warningCount && parsedError.warningCount > 0 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-300 dark:border-yellow-700">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                            <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>{parsedError.warningCount}</strong> advertencia(s) encontrada(s) en los logs
                            </span>
                        </div>
                    )}

                    {/* Lista de archivos faltantes */}
                    {missingFilesFormatted && (
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Database className="w-4 h-4 text-red-500" />
                                Archivos Faltantes ({parsedError.missingFiles?.length})
                            </h4>
                            <div className={cn(
                                "p-4 rounded-lg border font-mono text-sm",
                                "bg-muted/50 max-h-64 overflow-y-auto",
                                "whitespace-pre-wrap text-muted-foreground"
                            )}>
                                {missingFilesFormatted}
                            </div>
                        </div>
                    )}

                    {/* Excepción original */}
                    {latestBackup.Exception && (
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Excepción Original
                            </h4>
                            <pre className={cn(
                                "p-4 rounded-lg overflow-x-auto text-xs font-mono",
                                "bg-muted/80 border border-red-200 dark:border-red-800",
                                "max-h-48 overflow-y-auto",
                                "text-red-700 dark:text-red-300"
                            )}>
                                {latestBackup.Exception}
                            </pre>
                        </div>
                    )}

                    {/* Estadísticas del error */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <XCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                            <p className="text-xs text-muted-foreground">Errores</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                {latestBackup.ErrorsCount != null && !isNaN(latestBackup.ErrorsCount)
                                    ? latestBackup.ErrorsCount
                                    : "N/A"}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <RefreshCw className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                            <p className="text-xs text-muted-foreground">Reintentos</p>
                            <p className="text-lg font-bold">
                                {latestBackup.RetryAttempts != null && !isNaN(latestBackup.RetryAttempts)
                                    ? latestBackup.RetryAttempts
                                    : "N/A"}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                            <p className="text-xs text-muted-foreground">Advertencias</p>
                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                {parsedError.warningCount ?? 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <Database className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                            <p className="text-xs text-muted-foreground">Archivos Perdidos</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {parsedError.missingFiles?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});
