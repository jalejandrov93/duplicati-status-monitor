"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import DecryptedText from "@/components/ui/DecryptedText";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { useAnimatedHexagons } from "@/hooks/use-animated-hexagons";
import { hexagonPatternClassName } from "@/lib/hexagons";

export default function BlockedPage() {
  const [ip, setIp] = useState<string>("Desconocida");
  const hexagons = useAnimatedHexagons();

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 p-4 font-mono text-zinc-200">
      <HexagonPattern hexagons={hexagons} className={hexagonPatternClassName} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <ShieldAlert className="h-10 w-10" />
            </motion.div>

            <div className="space-y-2">
              <DecryptedText
                text="Acceso Restringido"
                className="text-2xl font-bold tracking-tight text-white"
              />
              <p className="text-sm leading-relaxed text-zinc-400">
                Nuestros sistemas de seguridad han bloqueado el acceso debido a
                políticas de restricción geográfica. Tu ubicación actual no
                tiene permisos para ingresar a este panel.
              </p>
            </div>

            <div className="flex w-full items-center gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">
                <Globe className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Dirección IP Detectada
                </span>
                <span className="text-sm font-medium tracking-wide text-zinc-300">
                  {ip}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="group mt-4 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver atrás
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Monitor de Respaldos Duplicati • Error 403
        </p>
      </motion.div>
    </div>
  );
}
