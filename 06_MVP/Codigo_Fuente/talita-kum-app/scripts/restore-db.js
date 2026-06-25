const fs = require("fs");
const path = require("path");
const { getBackupDir, getDbPath } = require("../config/paths");

const sourceArg = process.argv[2];

if (!sourceArg) {
  console.error("Uso: npm run db:restore -- <ruta-al-respaldo.db>");
  process.exit(1);
}

const sourcePath = path.resolve(sourceArg);
const dbPath = getDbPath();

if (!fs.existsSync(sourcePath)) {
  console.error(`El respaldo no existe: ${sourcePath}`);
  process.exit(1);
}

if (path.resolve(sourcePath) === path.resolve(dbPath)) {
  console.error("El respaldo no puede ser el mismo archivo activo de base de datos.");
  process.exit(1);
}

const preRestorePath = path.join(
  getBackupDir(),
  `pre-restore-${new Date().toISOString().replace(/[:.]/g, "-")}.db`
);

if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, preRestorePath);
  console.log(`Copia previa a restauracion: ${preRestorePath}`);
}

fs.copyFileSync(sourcePath, dbPath);
console.log(`Base de datos restaurada desde: ${sourcePath}`);
