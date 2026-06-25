const db = require("../config/db");
const { createDatabaseBackup } = require("../utils/backups");

createDatabaseBackup()
  .then((backupPath) => {
    console.log(`Respaldo creado: ${backupPath}`);
  })
  .catch((err) => {
    console.error(`No se pudo crear el respaldo: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
