"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import DecryptedText from "@/components/ui/DecryptedText";
import { HexagonPattern } from "@/components/ui/hexagon-pattern"
import { cn } from "@/lib/utils"

export default function BlockedPage() {
  const [ip, setIp] = useState<string>("Desconocida");
  const [hexagons, setHexagons] = useState<Array<[number, number]>>([]);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => {});

    // Generar hexágonos de fondo al azar para dar sensación dinámica
    const generateHexagons = () => {
      const hexes: Array<[number, number]> = [];
      for (let i = 0; i < 30; i++) {
        hexes.push([Math.floor(Math.random() * 25), Math.floor(Math.random() * 25)]);
      }
      setHexagons(hexes);
    };

    generateHexagons();
    const interval = setInterval(generateHexagons, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center p-4 text-zinc-200 font-mono">
      <HexagonPattern
        hexagons={hexagons}
        activeHexagonClassName="fill-red-500/30"
        className={cn(
          "absolute inset-0 h-full w-full skew-y-6",
          "mask-[radial-gradient(620px_circle_at_center,white,transparent)]"
        )}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient background effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
            >
              <ShieldAlert className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <DecryptedText
                text="Acceso Restringido"
                className="text-2xl font-bold tracking-tight text-white"
              />
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nuestros sistemas de seguridad han bloqueado el acceso debido a
                políticas de restricción geográfica. Tu ubicación actual no
                tiene permisos para ingresar a este panel.
              </p>
            </div>

            <div className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Globe className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  Dirección IP Detectada
                </span>
                <span className="text-sm font-medium text-zinc-300 tracking-wide">
                  {ip}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver atrás
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-zinc-600">
          Monitor de Respaldos Duplicati • Error 403
        </p>
      </motion.div>
    </div>
  );
}
