"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/animation-variants";
import type { LatestBackup } from "@/types/machine";

export interface ErrorDetailsProps {
    latestBackup: LatestBackup;
}

export const MachineErrorDetails = memo(function MachineErrorDetails({
    latestBackup,
}: ErrorDetailsProps) {
    if (!latestBackup.HasErrors) return null;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
        >
            <Card className="mb-8 border-red-200 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        Detalles del Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {latestBackup.Exception && (
                        <div>
                            <h4 className="font-semibold mb-2">Excepción:</h4>
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                {latestBackup.Exception}
                            </pre>
                        </div>
                    )}
                    {latestBackup.LogLines && latestBackup.LogLines.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Registros de Error:</h4>
                            <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
                                {latestBackup.LogLines.map((log: string, idx: number) => (
                                    <div key={idx} className="text-sm font-mono mb-1">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Contador de Errores
                            </p>
                            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {latestBackup.ErrorsCount != null && !isNaN(latestBackup.ErrorsCount)
                                    ? latestBackup.ErrorsCount
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Intentos de Reintentos
                            </p>
                            <p className="text-lg font-semibold">
                                {latestBackup.RetryAttempts != null && !isNaN(latestBackup.RetryAttempts)
                                    ? latestBackup.RetryAttempts
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});
