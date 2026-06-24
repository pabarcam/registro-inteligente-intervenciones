const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        correo TEXT,
        password TEXT,
        rol TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS pacientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS intervenciones(
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

});

module.exports = db;