"use client";

import { MonitorFooter } from "@/components/monitor/monitor-footer";
import { MonitorHeader } from "@/components/monitor/monitor-header";
import { MonitorToolbarProvider } from "@/components/monitor/monitor-toolbar-context";

export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MonitorToolbarProvider>
      <div className="flex min-h-screen flex-col">
        <MonitorHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <MonitorFooter />
      </div>
    </MonitorToolbarProvider>
  );
}
