"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BackupRecord } from "@/types/machine";

interface ActivityCalendarProps {
  recentBackups: BackupRecord[];
  days?: number;
}

export const ActivityCalendar = memo(function ActivityCalendar({
  recentBackups,
  days = 90,
}: ActivityCalendarProps) {
  const calendarData = useMemo(() => {
    const today = startOfToday();
    const startDate = subDays(today, days - 1);
    const interval = eachDayOfInterval({ start: startDate, end: today });

    return interval.map((day) => {
      const dayBackups = recentBackups.filter((b) =>
        isSameDay(new Date(b.EndTime), day)
      );

      const hasError = dayBackups.some((b) => b.Status === "ERROR");
      const hasWarning = dayBackups.some((b) => b.Status === "WARNING" || b.Status === "PARTIAL");
      const hasSuccess = dayBackups.some((b) => b.Status === "SUCCESS");

      let status: "none" | "success" | "warning" | "error" = "none";
      if (hasError) status = "error";
      else if (hasWarning) status = "warning";
      else if (hasSuccess) status = "success";

      return {
        date: day,
        count: dayBackups.length,
        status,
      };
    });
  }, [recentBackups, days]);

  const stats = useMemo(() => {
    const total = calendarData.filter(d => d.count > 0).length;
    const success = calendarData.filter(d => d.status === "success").length;
    const warning = calendarData.filter(d => d.status === "warning").length;
    const error = calendarData.filter(d => d.status === "error").length;

    return { total, success, warning, error };
  }, [calendarData]);

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Actividad de Backups (Últimos {days} días)</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>{stats.success} Éxitos</span>
             </div>
             <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>{stats.warning} Alertas</span>
             </div>
             <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>{stats.error} Fallos</span>
             </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-1.5">
            {calendarData.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.002 }}
                    className={cn(
                      "w-3 h-3 rounded-[2px] transition-colors",
                      day.status === "none" && "bg-muted hover:bg-muted/80",
                      day.status === "success" && "bg-green-500/80 hover:bg-green-500",
                      day.status === "warning" && "bg-yellow-500/80 hover:bg-yellow-500",
                      day.status === "error" && "bg-red-500/80 hover:bg-red-500"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">
                    {format(day.date, "PPP", { locale: es })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {day.count > 0
                      ? `${day.count} backup(s) ejecutado(s)`
                      : "Sin actividad"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
           <span>Menos</span>
           <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-[1px] bg-muted" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-green-500/80" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-red-500/80" />
           </div>
           <span>Más crítico</span>
        </div>
      </CardContent>
    </Card>
  );
});
