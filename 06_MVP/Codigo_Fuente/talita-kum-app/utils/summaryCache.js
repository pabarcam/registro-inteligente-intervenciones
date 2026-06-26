const db = require("../config/db");
const { sanitizeSummaryText } = require("./ia");

function persistSummary(paciente, resumen) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO resumenes (paciente, resumen, fecha_actualizacion)
       VALUES (?, ?, ?)
       ON CONFLICT(paciente) DO UPDATE
         SET resumen = excluded.resumen,
             fecha_actualizacion = excluded.fecha_actualizacion`,
      [paciente, resumen, new Date().toISOString()],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function loadSummary(paciente) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT resumen FROM resumenes WHERE paciente = ?",
      [paciente],
      (err, row) => (err ? reject(err) : resolve(row ? sanitizeSummaryText(row.resumen) : null))
    );
  });
}

function clearSummary(paciente) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM resumenes WHERE paciente = ?", [paciente], (err) =>
      err ? reject(err) : resolve()
    );
  });
}

module.exports = { persistSummary, loadSummary, clearSummary };
