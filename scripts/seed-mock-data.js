const mongoose = require("mongoose");
const { subDays, startOfToday, addMinutes, formatDistanceToNow } = require("date-fns");
const { es } = require("date-fns/locale");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI no definida en .env.local");
  process.exit(1);
}

// Esquema simplificado para el seeding (no requiere importar Mongoose Model de src)
const BackupSchema = new mongoose.Schema({
  MachineName: String,
  BackupName: String,
  BackupId: String,
  Status: String,
  ParsedResult: String,
  BeginTime: Date,
  EndTime: Date,
  RelativeEndTime: String,
  Duration: String,
  MainOperation: String,
  Version: String,
  ExaminedFiles: Number,
  SizeOfExaminedFilesMB: Number,
  AddedFiles: Number,
  ModifiedFiles: Number,
  DeletedFiles: Number,
  FilesWithError: Number,
  FreeQuotaSpaceMB: Number,
  TotalQuotaSpaceMB: Number,
  UsedQuotaSpaceMB: Number,
  QuotaUsagePercent: Number,
  WarningsCount: Number,
  ErrorsCount: Number,
  LogLines: [String],
  Exception: String,
  HasErrors: Boolean,
  ExecutionMode: String,
  ReceivedAt: { type: Date, default: Date.now }
}, { collection: "duplicati" });

const Backup = mongoose.models.Backup || mongoose.model("Backup", BackupSchema);

const MACHINES = [
  { name: "SRV-DATACENTER-01", status: "SUCCESS", quota: 85 },
  { name: "WORKSTATION-CEO", status: "WARNING", quota: 40 },
  { name: "DEV-MACHINE-SQL", status: "SUCCESS", quota: 15 },
  { name: "BACKUP-NAS-OFFICE", status: "ERROR", quota: 92 },
  { name: "WEB-PROD-MIRROR", status: "SUCCESS", quota: 60 }
];

async function seed() {
  try {
    console.log("⏳ Conectando a MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado exitosamente");

    console.log("🧹 Limpiando base de datos...");
    await Backup.deleteMany({});
    console.log("✅ Base de datos limpia");

    const today = startOfToday();
    const mockBackups = [];

    console.log("🏗️ Generando datos mock para 5 máquinas (90 días)...");

    for (const machine of MACHINES) {
      for (let i = 0; i < 90; i++) {
        // Probabilidad de no tener backup un día (5%)
        if (Math.random() < 0.05) continue;

        const date = subDays(today, i);
        const beginTime = addMinutes(date, Math.floor(Math.random() * 60));
        const durationMin = 15 + Math.floor(Math.random() * 120);
        const endTime = addMinutes(beginTime, durationMin);

        // Determinar estado aleatorio basado en la "personalidad" de la máquina
        let status = "SUCCESS";
        const rand = Math.random();

        if (machine.status === "ERROR" && i < 3) {
          status = "ERROR"; // Mantener error reciente si la máquina es de tipo ERROR
        } else if (rand < 0.1) {
          status = "WARNING";
        } else if (rand < 0.15) {
          status = "ERROR";
        }

        const examinedFiles = 5000 + Math.floor(Math.random() * 50000);
        const sizeMB = 1000 + Math.floor(Math.random() * 10000);

        mockBackups.push({
          MachineName: machine.name,
          BackupName: `Backup_${machine.name}`,
          BackupId: `id_${machine.name}_${i}`,
          Status: status,
          ParsedResult: status === "SUCCESS" ? "Success" : "Warning",
          BeginTime: beginTime,
          EndTime: endTime,
          RelativeEndTime: formatDistanceToNow(endTime, { addSuffix: true, locale: es }),
          Duration: `0${Math.floor(durationMin / 60)}:${durationMin % 60}:00`,
          MainOperation: "Backup",
          Version: "2.0.7.1_beta_2023-05-25",
          ExaminedFiles: examinedFiles,
          SizeOfExaminedFilesMB: sizeMB,
          AddedFiles: Math.floor(Math.random() * 100),
          ModifiedFiles: Math.floor(Math.random() * 50),
          DeletedFiles: Math.floor(Math.random() * 10),
          FilesWithError: status === "ERROR" ? Math.floor(Math.random() * 5) : 0,
          FreeQuotaSpaceMB: 100000 * (1 - machine.quota / 100),
          TotalQuotaSpaceMB: 100000,
          UsedQuotaSpaceMB: 100000 * (machine.quota / 100),
          QuotaUsagePercent: machine.quota,
          WarningsCount: status === "WARNING" ? 1 : 0,
          ErrorsCount: status === "ERROR" ? 1 : 0,
          LogLines: status === "ERROR" ? ["Error: Unexpected end of stream", "Stacktrace: ..."] : ["Backup started", "Uploading..."],
          Exception: status === "ERROR" ? "System.IO.IOException: Unexpected end of stream" : null,
          HasErrors: status === "ERROR",
          ExecutionMode: "Daily",
          ReceivedAt: endTime
        });
      }
    }

    await Backup.insertMany(mockBackups);
    console.log(`✅ ¡Éxito! Se insertaron ${mockBackups.length} registros de backup.`);

  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB");
  }
}

seed();
