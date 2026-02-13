"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animation-variants";
import type { StatusBadgeVariant } from "@/types/machine";
import { EncryptedText } from "@/components/ui/encrypted-text";

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

                <div className="flex gap-4 flex-row items-center justify-between">
                    <div>
                        <EncryptedText
                            text={machineName}
                            encryptedClassName="text-neutral-500"
                            revealedClassName="dark:text-white text-black"
                            revealDelayMs={50}
                        />
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
