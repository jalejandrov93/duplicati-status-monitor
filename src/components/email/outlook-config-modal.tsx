import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Server,
  Key,
  Shield,
  Loader2,
  AlertTriangle,
  MailWarning,
  HardDriveDownload,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OutlookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string | null;
}

interface ClientSettings {
  account: string;
  inbox_host: string;
  inbox_port: number;
  inbox_username: string;
  inbox_service: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  domain: string;
}

export function OutlookConfigModal({
  isOpen,
  onClose,
  email,
}: OutlookConfigModalProps) {
  const [config, setConfig] = useState<ClientSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pop3" | "imap">("pop3");

  useEffect(() => {
    if (!isOpen || !email) {
      setConfig(null);
      setError(null);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/emails/config?email=${encodeURIComponent(email)}`,
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener la configuración");
        }
        const data = await response.json();
        setConfig(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar configuración");
        toast.error("No se pudo cargar la configuración de Outlook");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [isOpen, email]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-4 space-y-1">
              <h3 className="text-xl font-bold tracking-tight">
                Configuración de Correo
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                Parámetros de conexión para{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Consultando cPanel...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-sm font-semibold text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}

            {!loading && !error && config && (
              <div className="space-y-4">
                {/* Espacio Limitado - Alerta POP3 */}
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <MailWarning className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      ¡Acción recomendada para ahorrar espacio!
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Como la cuota en el servidor es muy limitada, te sugerimos
                    configurar la cuenta utilizando el protocolo{" "}
                    <span className="font-bold text-foreground">POP3</span>.
                    POP3 descarga y remueve los correos del servidor liberando
                    espacio, evitando que la cuenta se bloquee.
                  </p>
                </div>

                {/* Tabs Selector */}
                <div className="flex rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("pop3")}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      activeTab === "pop3"
                        ? "bg-card text-foreground shadow"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <HardDriveDownload className="h-3.5 w-3.5" />
                    POP3 (Recomendado)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("imap")}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      activeTab === "imap"
                        ? "bg-card text-foreground shadow"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Server className="h-3.5 w-3.5" />
                    IMAP (Alternativo)
                  </button>
                </div>

                {/* Connection Box */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Shield className="h-4.5 w-4.5" />
                    <span className="text-sm font-bold">
                      Configuración SSL/TLS Segura (Recomendada)
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {/* User */}
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          Nombre de Usuario
                        </span>
                        <p className="font-mono font-medium text-xs truncate max-w-[280px]">
                          {config.inbox_username}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          handleCopy(config.inbox_username, "username")
                        }
                      >
                        {copiedField === "username" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Incoming Server */}
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          Servidor de Entrada ({activeTab.toUpperCase()})
                        </span>
                        <p className="font-mono font-medium text-xs">
                          {config.inbox_host}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(config.inbox_host, "in_host")}
                      >
                        {copiedField === "in_host" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Incoming Port */}
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          Puerto de Entrada ({activeTab.toUpperCase()})
                        </span>
                        <p className="font-mono font-medium text-xs">
                          {activeTab === "pop3" ? 995 : 993}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          handleCopy(
                            activeTab === "pop3" ? "995" : "993",
                            "in_port",
                          )
                        }
                      >
                        {copiedField === "in_port" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Outgoing Server */}
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          Servidor de Salida (SMTP)
                        </span>
                        <p className="font-mono font-medium text-xs">
                          {config.smtp_host || config.inbox_host}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          handleCopy(
                            config.smtp_host || config.inbox_host,
                            "out_host",
                          )
                        }
                      >
                        {copiedField === "out_host" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Outgoing Port */}
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">
                          Puerto SMTP (Salida)
                        </span>
                        <p className="font-mono font-medium text-xs">
                          {config.smtp_port || 465}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          handleCopy(
                            String(config.smtp_port || 465),
                            "out_port",
                          )
                        }
                      >
                        {copiedField === "out_port" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="rounded-xl border bg-muted/30 p-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Key className="h-4 w-4 shrink-0 text-foreground" />
                    <div>
                      <span className="font-semibold text-foreground">
                        Autenticación:
                      </span>{" "}
                      El servidor requiere autenticación para enviar correos (usa el mismo usuario y contraseña).
                    </div>
                  </div>
                  {activeTab === "pop3" && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                      <div>
                        <span className="font-semibold text-foreground">
                          Nota de espacio:
                        </span>{" "}
                        Asegurate de activar la opción "Dejar copia en el servidor
                        por un máximo de 14 días" para que se limpien del hosting
                        automáticamente.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
