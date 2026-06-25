const path = require("path");
const db = require("../config/db");
const { getBackupDir } = require("../config/paths");

function timestampForFileName(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function createDatabaseBackup(targetDir = getBackupDir()) {
  const backupPath = path.join(targetDir, `database-${timestampForFileName()}.db`);

  return new Promise((resolve, reject) => {
    db.run("VACUUM INTO ?", [backupPath], (err) => {
      if (err) return reject(err);
      return resolve(backupPath);
    });
  });
}

function startScheduledBackups() {
  if (process.env.BACKUP_ENABLED === "false") {
    return null;
  }

  const intervalHours = Number.parseFloat(process.env.BACKUP_INTERVAL_HOURS || "24");
  const intervalMs = Math.max(intervalHours, 1) * 60 * 60 * 1000;

  const timer = setInterval(() => {
    createDatabaseBackup().catch((err) => {
      console.error("[backup] No se pudo crear respaldo de base de datos:", err.message);
    });
  }, intervalMs);

  timer.unref();
  return timer;
}

module.exports = { createDatabaseBackup, startScheduledBackups };
