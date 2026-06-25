-- Esquema base del MVP Registro Inteligente de Intervenciones

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  correo TEXT UNIQUE,
  password TEXT,
  rol TEXT
);

CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT
);

CREATE TABLE IF NOT EXISTS intervenciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente TEXT,
  terapeuta TEXT,
  fecha TEXT,
  descripcion TEXT,
  objetivo TEXT,
  acuerdos TEXT,
  observaciones TEXT
);

INSERT INTO usuarios (nombre, correo, password, rol)
SELECT 'Administrador', 'admin@talita.com', '$2b$12$WEj9fPldpCiJOXCVmWdXz.8ru6vcqG3mzHpjoLWNcOa9KQrZTxKFu', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@talita.com');
