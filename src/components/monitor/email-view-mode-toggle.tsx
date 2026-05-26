"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailViewMode } from "@/hooks/use-email-monitor-settings";
import { cn } from "@/lib/utils";

interface EmailViewModeToggleProps {
  viewMode: EmailViewMode;
  onViewModeChange: (mode: EmailViewMode) => void;
}

export function EmailViewModeToggle({
  viewMode,
  onViewModeChange,
}: EmailViewModeToggleProps) {
  return (
    <div
      className="flex items-center rounded-full border bg-muted/50 p-1"
      role="group"
      aria-label="Modo de vista"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("cards")}
        className={cn(
          "h-8 w-8 rounded-full",
          viewMode === "cards" && "bg-background shadow-sm",
        )}
        aria-label="Vista en tarjetas"
        aria-pressed={viewMode === "cards"}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 w-8 rounded-full",
          viewMode === "list" && "bg-background shadow-sm",
        )}
        aria-label="Vista en lista"
        aria-pressed={viewMode === "list"}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
