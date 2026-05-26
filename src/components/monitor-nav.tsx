"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEmailMonitorAccess } from "@/hooks/use-email-monitor-access";

const navItems: Array<{
  href: string;
  label: string;
  requiresEmailAccess?: boolean;
}> = [
  { href: "/", label: "Backups" },
  { href: "/correos", label: "Correos", requiresEmailAccess: true },
];

export function MonitorNav() {
  const pathname = usePathname();
  const { hasAccess, isLoading } = useEmailMonitorAccess();

  return (
    <nav
      className="flex items-center gap-1 rounded-full border bg-muted/50 p-1"
      aria-label="Navegación del monitor"
    >
      {navItems.map((item) => {
        if (item.requiresEmailAccess && !isLoading && !hasAccess) {
          return null;
        }

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
