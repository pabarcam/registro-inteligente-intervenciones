const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("./paths");
const { hashPassword, isPasswordHash } = require("../utils/passwords");

const dbPath = getDbPath();
const db = new sqlite3.Database(dbPath);
db.filePath = dbPath;

function migrateLegacyPasswords(tableName) {
  db.all(`SELECT id, password FROM ${tableName}`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    (rows || []).forEach((row) => {
      if (row.password && !isPasswordHash(row.password)) {
        db.run(
          `UPDATE ${tableName} SET password = ? WHERE id = ?`,
          [hashPassword(row.password), row.id],
          (updateErr) => {
            if (updateErr) console.error(updateErr);
          }
        );
      }
    });
  });
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      correo TEXT UNIQUE,
      password TEXT,
      rol TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS terapeutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      correo TEXT UNIQUE,
      password TEXT,
      especialidad TEXT,
      aprobado INTEGER DEFAULT 0
    )
  `);

  db.run(`ALTER TABLE terapeutas ADD COLUMN aprobado INTEGER DEFAULT 0`, [], (err) => {
    if (err && !/duplicate column name/i.test(err.message)) {
      console.error(err);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS intervenciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente TEXT,
      terapeuta TEXT,
      fecha TEXT,
      descripcion TEXT,
      objetivo TEXT,
      acuerdos TEXT,
      observaciones TEXT,
      audio_path TEXT
    )
  `);

  db.run(`ALTER TABLE intervenciones ADD COLUMN audio_path TEXT`, [], (err) => {
    if (err && !/duplicate column name/i.test(err.message)) {
      console.error(err);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS resumenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente TEXT UNIQUE,
      resumen TEXT,
      fecha_actualizacion TEXT
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM usuarios", [], (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(
        "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)",
        ["Administrador", "admin@talita.com", hashPassword("123456"), "admin"]
      );
    }
  });

  db.get("SELECT COUNT(*) AS count FROM terapeutas", [], (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(
        "INSERT INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, ?)",
        ["Dra. Valeria Ramos", "terapeuta@talita.com", hashPassword("123456"), "Salud mental", 1]
      );
    }
  });

  migrateLegacyPasswords("usuarios");
  migrateLegacyPasswords("terapeutas");
});

module.exports = db;
