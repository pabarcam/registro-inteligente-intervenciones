const fs = require("fs");
const path = require("path");

const appRoot = path.join(__dirname, "..");

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveManagedPath(envValue, fallbackPath) {
  return envValue ? path.resolve(envValue) : fallbackPath;
}

function getDataDir() {
  const dataDir = resolveManagedPath(process.env.DATA_DIR, path.join(appRoot, "data"));
  ensureDirectory(dataDir);
  return dataDir;
}

function getDbPath() {
  const dbPath = resolveManagedPath(process.env.DB_PATH, path.join(getDataDir(), "database.db"));
  ensureDirectory(path.dirname(dbPath));
  const legacyDbPath = path.join(appRoot, "database", "database.db");

  if (!process.env.DB_PATH && !fs.existsSync(dbPath) && fs.existsSync(legacyDbPath)) {
    fs.copyFileSync(legacyDbPath, dbPath);
  }

  return dbPath;
}

function getBackupDir() {
  const backupDir = resolveManagedPath(process.env.BACKUP_DIR, path.join(getDataDir(), "backups"));
  ensureDirectory(backupDir);
  return backupDir;
}

module.exports = { appRoot, getBackupDir, getDataDir, getDbPath };
