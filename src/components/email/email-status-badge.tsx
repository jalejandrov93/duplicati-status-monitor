"use client";

import { EmailQuotaStatus } from "@/types/email";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function getEmailStatusConfig(status: EmailQuotaStatus) {
  switch (status) {
    case "SUCCESS":
      return {
        iconColor: "text-green-500",
        Icon: CheckCircle2,
        label: "Normal",
      };
    case "WARNING":
      return {
        iconColor: "text-yellow-500",
        Icon: AlertTriangle,
        label: "Advertencia",
      };
    case "ERROR":
      return {
        iconColor: "text-red-500",
        Icon: XCircle,
        label: "Crítico",
      };
    default:
      return {
        iconColor: "text-gray-500",
        Icon: Mail,
        label: "Desconocido",
      };
  }
}

interface EmailStatusBadgeProps {
  status: EmailQuotaStatus;
  className?: string;
}

export function EmailStatusBadge({ status, className }: EmailStatusBadgeProps) {
  const statusConfig = getEmailStatusConfig(status);
  const StatusIcon = statusConfig.Icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", statusConfig.iconColor, className)}
    >
      <StatusIcon className="h-3 w-3" />
      {statusConfig.label}
    </Badge>
  );
}
