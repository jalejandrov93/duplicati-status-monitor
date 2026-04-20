"use client";

import { useState } from "react";
import { Monitor, Terminal, Copy, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedError } from "@/lib/error-parser";

interface RecommendationsPanelProps {
  parsedError: ParsedError;
  className?: string;
}

export function RecommendationsPanel({ parsedError, className }: RecommendationsPanelProps) {
  const [activeTab, setActiveTab] = useState<"gui" | "cli">("gui");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (parsedError.guiSteps.length === 0 && parsedError.cliCommands.length === 0) return null;

  const handleCopy = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard not available (e.g. non-HTTPS context) — fail silently
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Tab bar */}
      <div className="flex border-b border-border bg-muted/30">
        <button
          onClick={() => setActiveTab("gui")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors",
            activeTab === "gui"
              ? "border-b-2 border-primary text-primary bg-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Monitor className="w-4 h-4" />
          Pasos en GUI
        </button>
        <button
          onClick={() => setActiveTab("cli")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors",
            activeTab === "cli"
              ? "border-b-2 border-primary text-primary bg-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Terminal className="w-4 h-4" />
          Comandos CLI
        </button>
      </div>

      <div className="p-5">
        {activeTab === "gui" && (
          <ol className="space-y-3">
            {parsedError.guiSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex items-start gap-1 text-sm text-foreground leading-relaxed">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0" />
                  <span>{step}</span>
                </div>
              </li>
            ))}
          </ol>
        )}

        {activeTab === "cli" && (
          <div className="space-y-4">
            {parsedError.cliCommands.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono bg-muted border border-border text-foreground overflow-x-auto whitespace-pre">
                    {item.command}
                  </code>
                  <button
                    onClick={() => handleCopy(item.command, i)}
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg border transition-colors",
                      copiedIndex === i
                        ? "border-green-400 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-border bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                    title="Copiar comando"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
