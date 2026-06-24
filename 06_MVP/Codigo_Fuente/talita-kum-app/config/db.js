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
      observaciones TEXT
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM usuarios", [], (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(
        "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)",
        ["Administrador", "admin@talita.com", "123456", "admin"]
      );
    }
  });
});

module.exports = db;