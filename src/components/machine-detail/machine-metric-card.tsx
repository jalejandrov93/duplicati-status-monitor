"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animation-variants";

export interface MetricCardProps {
    title: string;
    icon: React.ReactNode;
    value: string | number;
    subtitle?: string;
    index: number;
}

export const MachineMetricCard = memo(function MachineMetricCard({
    title,
    icon,
    value,
    subtitle,
    index,
}: MetricCardProps) {
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
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        {icon}
                        <div>
                            <div className="text-3xl font-bold">{value}</div>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});
