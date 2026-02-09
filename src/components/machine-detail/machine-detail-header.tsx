"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animation-variants";
import type { StatusBadgeVariant } from "@/types/machine";

export interface MachineDetailHeaderProps {
    machineName: string;
    status: string;
    relativeEndTime?: string;
    statusBadgeVariant: StatusBadgeVariant;
}

export const MachineDetailHeader = memo(function MachineDetailHeader({
    machineName,
    status,
    relativeEndTime,
    statusBadgeVariant,
}: MachineDetailHeaderProps) {
    const router = useRouter();

    const handleBack = useCallback(() => {
        router.push("/");
    }, [router]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="border-b bg-card"
        >
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="default"
                    onClick={handleBack}
                    className="mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Panel
                </Button>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {machineName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Último respaldo: {relativeEndTime || "N/A"}
                        </p>
                    </div>

                    <Badge
                        variant={statusBadgeVariant as any}
                        className="text-lg py-2 px-4 self-start md:self-auto"
                    >
                        {status}
                    </Badge>
                </div>
            </div>
        </motion.div>
    );
});
