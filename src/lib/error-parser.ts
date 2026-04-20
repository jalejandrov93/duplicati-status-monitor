import { getRecommendations } from "./recommendations";
import type { CliCommand } from "./recommendations";

export type DuplicatiErrorType =
  | "MISSING_FILES"           // Archivos faltantes en storage remoto
  | "CORRUPTED_FILES"         // Archivos corruptos en storage remoto
  | "PERMISSION_DENIED"      // Error de permisos
  | "ENCRYPTION_ERROR"        // Error de contraseña/encriptación
  | "TIMEOUT"                 // Tiempo de espera agotado
  | "CONNECTION_ERROR"       // Error de conexión al storage
  | "DISK_FULL"               // Disco lleno
  | "DATABASE_CORRUPT"        // Base de datos corrupta
  | "UNKNOWN";                // Error desconocido

export interface ParsedError {
  errorType: DuplicatiErrorType;
  errorTitle: string;
  errorDescription: string;
  suggestedCommand: string;
  suggestedAction: string;
  isRepairable: boolean;
  missingFiles?: string[];
  warningCount?: number;
  guiSteps: string[];
  cliCommands: CliCommand[];
}

export function parseDuplicatiError(exception: string, logLines?: string[]): ParsedError {
  const missingFiles = extractMissingFiles(logLines);
  const warningCount = countWarnings(logLines);

  if (exception.includes("RemoteListVerificationException")) {
    const rec = getRecommendations("MISSING_FILES");
    return {
      errorType: "MISSING_FILES",
      errorTitle: "Archivos Faltantes en Storage Remoto",
      errorDescription: `Se detectaron ${missingFiles.length} archivos faltantes en el almacenamiento remoto. El respaldo no puede continuar hasta que se reparen los archivos faltantes.`,
      suggestedCommand: "repair",
      suggestedAction: "Ejecutar comando de reparación para sincronizar la base de datos local con el storage remoto",
      isRepairable: true,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (exception.includes("UnauthorizedAccessException") || exception.includes("AccessDenied")) {
    const rec = getRecommendations("PERMISSION_DENIED");
    return {
      errorType: "PERMISSION_DENIED",
      errorTitle: "Error de Permisos",
      errorDescription: "No se tiene acceso al almacenamiento remoto. Verificar credenciales y permisos.",
      suggestedCommand: "verify-credentials",
      suggestedAction: "Verificar que las credenciales de acceso al storage sean correctas y tengan permisos adecuados",
      isRepairable: false,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (
    exception.includes("EncryptionException") ||
    exception.includes("DecryptionException") ||
    exception.includes("passphrase")
  ) {
    const rec = getRecommendations("ENCRYPTION_ERROR");
    return {
      errorType: "ENCRYPTION_ERROR",
      errorTitle: "Error de Encriptación",
      errorDescription: "Error al desencriptar los archivos de respaldo. La contraseña podría ser incorrecta.",
      suggestedCommand: "verify-encryption",
      suggestedAction: "Verificar que la contraseña de encriptación sea correcta",
      isRepairable: false,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (
    exception.includes("TimeoutException") ||
    exception.includes("timeout") ||
    exception.includes("timed out")
  ) {
    const rec = getRecommendations("TIMEOUT");
    return {
      errorType: "TIMEOUT",
      errorTitle: "Tiempo de Espera Agotado",
      errorDescription: "La operación tardó demasiado y fue cancelada. Puede ser un problema de conexión lenta.",
      suggestedCommand: "retry",
      suggestedAction: "Reintentar el respaldo o verificar la conexión a internet",
      isRepairable: true,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (
    exception.includes("WebException") ||
    exception.includes("HttpException") ||
    exception.includes("connection")
  ) {
    const rec = getRecommendations("CONNECTION_ERROR");
    return {
      errorType: "CONNECTION_ERROR",
      errorTitle: "Error de Conexión",
      errorDescription: "No se puede conectar al almacenamiento remoto. Verificar la configuración de red.",
      suggestedCommand: "test-storage",
      suggestedAction: "Verificar la conexión al storage remoto y la configuración de red",
      isRepairable: true,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (exception.includes("IOException") && (exception.includes("disk") || exception.includes("space"))) {
    const rec = getRecommendations("DISK_FULL");
    return {
      errorType: "DISK_FULL",
      errorTitle: "Espacio en Disco Insuficiente",
      errorDescription: "No hay suficiente espacio en disco para completar la operación.",
      suggestedCommand: "check-space",
      suggestedAction: "Liberar espacio en disco o aumentar la cuota de almacenamiento",
      isRepairable: false,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (exception.includes("DatabaseCorruptException") || exception.includes("SQLiteException")) {
    const rec = getRecommendations("DATABASE_CORRUPT");
    return {
      errorType: "DATABASE_CORRUPT",
      errorTitle: "Base de Datos Corrupta",
      errorDescription: "La base de datos local de Duplicati está corrupta y necesita ser reconstruida.",
      suggestedCommand: "repair",
      suggestedAction: "Ejecutar comando de reparación para reconstruir la base de datos desde el storage remoto",
      isRepairable: true,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  if (
    exception.includes("CorruptedRemoteFile") ||
    exception.includes("HashMismatch") ||
    exception.includes("InvalidManifest") ||
    exception.includes("InvalidSignature")
  ) {
    const rec = getRecommendations("CORRUPTED_FILES");
    return {
      errorType: "CORRUPTED_FILES",
      errorTitle: "Archivos Corruptos en Storage Remoto",
      errorDescription: "Se detectaron archivos de respaldo corruptos en el almacenamiento remoto. La integridad de los datos puede estar comprometida.",
      suggestedCommand: "verify",
      suggestedAction: "Verificar la integridad del backup remoto y reconstruir los bloques corruptos",
      isRepairable: true,
      missingFiles,
      warningCount,
      ...rec,
    };
  }

  const rec = getRecommendations("UNKNOWN");
  return {
    errorType: "UNKNOWN",
    errorTitle: "Error Desconocido",
    errorDescription: "Ocurrió un error inesperado. Revisar los logs para más detalles.",
    suggestedCommand: "diagnose",
    suggestedAction: "Revisar los logs de error y contactar soporte si es necesario",
    isRepairable: false,
    missingFiles,
    warningCount,
    ...rec,
  };
}

/**
 * Extrae la lista de archivos faltantes de los log lines
 */
function extractMissingFiles(logLines?: string[]): string[] {
  if (!logLines || logLines.length === 0) return [];
  
  const missingFiles: string[] = [];
  const missingFileRegex = /Missing file: (.+\.aes)/i;
  
  for (const line of logLines) {
    const match = line.match(missingFileRegex);
    if (match) {
      missingFiles.push(match[1]);
    }
  }
  
  return missingFiles;
}

/**
 * Cuenta las advertencias en los log lines
 */
function countWarnings(logLines?: string[]): number {
  if (!logLines || logLines.length === 0) return 0;
  
  return logLines.filter(line => line.includes("[Warning-")).length;
}

/**
 * Obtiene el color y configuración visual según el tipo de error
 */
export function getErrorTypeConfig(errorType: DuplicatiErrorType) {
  switch (errorType) {
    case "MISSING_FILES":
      return {
        color: "red",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-300 dark:border-red-700",
        iconColor: "text-red-600 dark:text-red-400",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: "database",
      };
    case "CORRUPTED_FILES":
      return {
        color: "orange",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-300 dark:border-orange-700",
        iconColor: "text-orange-600 dark:text-orange-400",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        icon: "file-x",
      };
    case "PERMISSION_DENIED":
      return {
        color: "amber",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-300 dark:border-amber-700",
        iconColor: "text-amber-600 dark:text-amber-400",
        badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: "lock",
      };
    case "ENCRYPTION_ERROR":
      return {
        color: "violet",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-300 dark:border-violet-700",
        iconColor: "text-violet-600 dark:text-violet-400",
        badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
        icon: "key",
      };
    case "TIMEOUT":
      return {
        color: "yellow",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: "clock",
      };
    case "CONNECTION_ERROR":
      return {
        color: "sky",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-300 dark:border-sky-700",
        iconColor: "text-sky-600 dark:text-sky-400",
        badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
        icon: "wifi-off",
      };
    case "DISK_FULL":
      return {
        color: "rose",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-300 dark:border-rose-700",
        iconColor: "text-rose-600 dark:text-rose-400",
        badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
        icon: "hard-drive",
      };
    case "DATABASE_CORRUPT":
      return {
        color: "purple",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-300 dark:border-purple-700",
        iconColor: "text-purple-600 dark:text-purple-400",
        badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        icon: "database",
      };
    default:
      return {
        color: "gray",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-300 dark:border-gray-700",
        iconColor: "text-gray-600 dark:text-gray-400",
        badgeColor: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: "alert-circle",
      };
  }
}

/**
 * Formatea una lista de archivos para mostrar de forma más legible
 */
export function formatMissingFilesList(files: string[], maxDisplay: number = 10): string {
  if (files.length === 0) return "";
  
  const displayed = files.slice(0, maxDisplay);
  const remaining = files.length - maxDisplay;
  
  const list = displayed.map(file => {
    // Extraer solo el nombre del archivo sin路径
    const fileName = file.split("/").pop() || file;
    return `• ${fileName}`;
  }).join("\n");
  
  if (remaining > 0) {
    return `${list}\n... y ${remaining} archivos más`;
  }
  
  return list;
}
