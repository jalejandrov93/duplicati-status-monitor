import type { DuplicatiErrorType } from "./error-parser";

export interface CliCommand {
  command: string;
  description: string;
}

export interface Recommendation {
  guiSteps: string[];
  cliCommands: CliCommand[];
}

const RECOMMENDATIONS: Record<DuplicatiErrorType, Recommendation> = {
  MISSING_FILES: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati en el navegador (por defecto: http://localhost:8200).",
      "En el panel principal, localizá el backup afectado y hacé clic en su nombre.",
      "En el menú del backup, seleccioná \"Reparar\" (Repair).",
      "Confirmá la reparación cuando se solicite. Duplicati reconstruirá la base de datos local descargando los índices del storage remoto.",
      "Una vez completado, ejecutá el backup nuevamente para verificar que no haya más archivos faltantes.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli repair <storage-url> --passphrase=<passphrase>",
        description: "Reconstruye la base de datos local sincronizando contra el storage remoto.",
      },
      {
        command: "duplicati-cli list <storage-url> --passphrase=<passphrase>",
        description: "Lista los archivos disponibles en el storage remoto para verificar el estado.",
      },
    ],
  },

  CORRUPTED_FILES: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati en el navegador (por defecto: http://localhost:8200).",
      "En el panel principal, localizá el backup afectado y hacé clic en su nombre.",
      "Seleccioná \"Ver log\" (Show Log) y revisá las entradas de tipo Error para identificar qué archivos están corruptos.",
      "En el menú del backup, seleccioná \"Verificar\" (Verify) para confirmar qué bloques están dañados.",
      "Si la verificación falla, seleccioná \"Reparar\" (Repair). Si el error persiste, puede ser necesario eliminar el backup remoto y crear uno nuevo desde cero.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli verify <storage-url> --passphrase=<passphrase>",
        description: "Verifica la integridad de los bloques de datos en el storage remoto.",
      },
      {
        command: "duplicati-cli repair <storage-url> --passphrase=<passphrase> --rebuild-missing-dblock-files",
        description: "Reconstruye bloques de datos faltantes o corruptos si los archivos fuente siguen disponibles localmente.",
      },
    ],
  },

  PERMISSION_DENIED: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati en el navegador (por defecto: http://localhost:8200).",
      "En el panel principal, hacé clic en \"Editar\" (Edit) sobre el backup afectado.",
      "Navegá al paso 2 \"Destino\" (Destination / Storage) y revisá las credenciales: usuario, contraseña, token o clave de acceso.",
      "Hacé clic en \"Probar conexión\" (Test Connection) para verificar que las credenciales sean correctas.",
      "Guardá los cambios y ejecutá el backup nuevamente.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli test <storage-url> --passphrase=<passphrase>",
        description: "Verifica que el storage remoto sea accesible con las credenciales actuales.",
      },
    ],
  },

  ENCRYPTION_ERROR: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati en el navegador (por defecto: http://localhost:8200).",
      "En el panel principal, hacé clic en \"Editar\" (Edit) sobre el backup afectado.",
      "Navegá al paso 3 \"Opciones\" (Options) o a la sección de encriptación y verificá que la passphrase sea la correcta.",
      "Si cambiaste la passphrase previamente, recordá que los respaldos existentes NO pueden desencriptarse con la nueva clave.",
      "Para restaurar con la passphrase original: usá \"Restaurar desde otra configuración\" e ingresá la passphrase anterior.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli test <storage-url> --passphrase=<passphrase-correcta>",
        description: "Verifica que la passphrase provista permita acceder al backup remoto.",
      },
      {
        command: "duplicati-cli list <storage-url> --passphrase=<passphrase-correcta>",
        description: "Lista los archivos del backup para confirmar que la passphrase es válida.",
      },
    ],
  },

  TIMEOUT: {
    guiSteps: [
      "Verificá que el servidor de destino esté en línea y accesible desde esta máquina.",
      "Abrí la interfaz web de Duplicati y hacé clic en \"Editar\" (Edit) sobre el backup afectado.",
      "Navegá al paso 5 \"Opciones avanzadas\" (Advanced Options) y buscá la opción `http-operation-timeout`.",
      "Aumentá el valor (por defecto suele ser 100 segundos). Valores recomendados: 300–600 segundos para conexiones lentas.",
      "Guardá los cambios y ejecutá el backup nuevamente.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli test <storage-url> --passphrase=<passphrase>",
        description: "Verifica que el storage remoto responda antes de reintentar el backup.",
      },
      {
        command: "duplicati-cli backup <ruta-local> <storage-url> --passphrase=<passphrase> --http-operation-timeout=300s",
        description: "Ejecuta el backup con un timeout extendido de 300 segundos por operación.",
      },
    ],
  },

  CONNECTION_ERROR: {
    guiSteps: [
      "Verificá la conectividad de red desde la máquina: intentá hacer ping o acceder al servidor de destino por navegador.",
      "Abrí la interfaz web de Duplicati y hacé clic en \"Editar\" (Edit) sobre el backup afectado.",
      "Navegá al paso 2 \"Destino\" y hacé clic en \"Probar conexión\" (Test Connection) para diagnóstico.",
      "Revisá que la URL del storage, el puerto y el protocolo (FTP, SFTP, S3, etc.) sean correctos.",
      "Si usás proxy, verificá la configuración de proxy en Opciones Avanzadas.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli test <storage-url> --passphrase=<passphrase>",
        description: "Prueba la conectividad y las credenciales contra el storage remoto.",
      },
    ],
  },

  DISK_FULL: {
    guiSteps: [
      "Verificá el espacio disponible en el disco local (donde Duplicati almacena archivos temporales durante el backup).",
      "Abrí la interfaz web de Duplicati y hacé clic en el backup afectado.",
      "Seleccioná \"Compactar\" (Compact) en el menú para eliminar versiones antiguas y liberar espacio en el storage remoto.",
      "Si el problema es el disco local, liberá espacio o cambiá el directorio temporal en Opciones Avanzadas (`tempdir`).",
      "Revisá la política de retención del backup (cuántas versiones se guardan) en el paso 4 de la configuración.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli compact <storage-url> --passphrase=<passphrase>",
        description: "Elimina versiones antiguas del storage remoto para recuperar espacio.",
      },
      {
        command: "duplicati-cli backup <ruta-local> <storage-url> --passphrase=<passphrase> --tempdir=<ruta-con-espacio>",
        description: "Ejecuta el backup usando un directorio temporal alternativo con más espacio.",
      },
    ],
  },

  DATABASE_CORRUPT: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati en el navegador (por defecto: http://localhost:8200).",
      "En el panel principal, localizá el backup afectado y hacé clic en su nombre.",
      "Seleccioná \"Reparar\" (Repair) en el menú. Duplicati eliminará la base de datos local corrupta y la reconstruirá descargando los índices del storage remoto.",
      "El proceso puede tardar varios minutos dependiendo del tamaño del backup. No interrumpas la operación.",
      "Una vez completada la reparación, ejecutá el backup para verificar que funcione correctamente.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli repair <storage-url> --passphrase=<passphrase>",
        description: "Reconstruye la base de datos SQLite local desde los índices del storage remoto.",
      },
    ],
  },

  UNKNOWN: {
    guiSteps: [
      "Abrí la interfaz web de Duplicati y navegá al menú \"Log\" (Activity → Show Log) del backup afectado.",
      "Buscá las entradas marcadas como Error o Warning y copiá el mensaje completo.",
      "Revisá el log del sistema del servidor para errores relacionados (Event Viewer en Windows, journalctl en Linux).",
      "Si el error persiste, probá ejecutar \"Verificar\" (Verify) seguido de \"Reparar\" (Repair) desde el menú del backup.",
      "Consultá la documentación oficial de Duplicati o el foro de la comunidad con el mensaje de error completo.",
    ],
    cliCommands: [
      {
        command: "duplicati-cli test <storage-url> --passphrase=<passphrase>",
        description: "Primer diagnóstico: verifica conectividad y acceso al storage remoto.",
      },
      {
        command: "duplicati-cli verify <storage-url> --passphrase=<passphrase>",
        description: "Verifica la integridad de los archivos de backup en el storage.",
      },
    ],
  },
};

export function getRecommendations(errorType: DuplicatiErrorType): Recommendation {
  return RECOMMENDATIONS[errorType];
}
