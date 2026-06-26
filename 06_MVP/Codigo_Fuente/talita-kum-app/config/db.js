const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "database", "database.db");
const db = new sqlite3.Database(dbPath);

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

  const bcrypt = require("bcryptjs");
  const adminHash = bcrypt.hashSync("Admin.123", 12);

  db.get("SELECT COUNT(*) AS count FROM usuarios", [], (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(
        "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)",
        ["Administrador", "admin@talita.com", adminHash, "admin"]
      );
    }
  });
});

module.exports = db;