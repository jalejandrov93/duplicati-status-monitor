"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animation-variants";
import { formatBytes } from "@/lib/utils";

export interface QuotaCardProps {
    currentQuotaUsage: number;
    usedQuotaSpace: number;
    totalQuotaSpace: number;
    index: number;
}

export const MachineQuotaCard = memo(function MachineQuotaCard({
    currentQuotaUsage,
    usedQuotaSpace,
    totalQuotaSpace,
    index,
}: QuotaCardProps) {
    const quotaValue = !isNaN(currentQuotaUsage) ? currentQuotaUsage : 0;
    const usedSpace = !isNaN(usedQuotaSpace) ? usedQuotaSpace : 0;
    const totalSpace = !isNaN(totalQuotaSpace) ? totalQuotaSpace : 0;

    return (
        <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300 h-full border-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Uso de Cuota
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-2">
                        {quotaValue?.toFixed(1) ?? 0}%
                    </div>
                    <Progress value={quotaValue} max={100} />
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatBytes(usedSpace * 1024 * 1024)} de{" "}
                        {formatBytes(totalSpace * 1024 * 1024)}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
});
