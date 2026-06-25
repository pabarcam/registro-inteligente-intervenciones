const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildPatientSummaryAsync } = require("../utils/ia");

const router = express.Router();

/* ── Persiste resumen en BD ──────────────────────────────── */
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

/* ── Carga resumen guardado ──────────────────────────────── */
function loadSummary(paciente) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT resumen FROM resumenes WHERE paciente = ?",
      [paciente],
      (err, row) => (err ? reject(err) : resolve(row ? row.resumen : null))
    );
  });
}

/* ══════════════════════════════════════════════════════════
   GET /intervenciones/dashboard
   Dashboard principal de la terapeuta — listado de pacientes
   ══════════════════════════════════════════════════════════ */
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const usuario =
      req.session.terapeuta || req.session.usuario || null;

    // Nombre del terapeuta activo (para filtrar)
    const nombreTerapeuta =
      usuario && usuario.nombre ? usuario.nombre : null;

    // Traer intervenciones (si es profesional, solo las suyas)
    const isAdmin = usuario && usuario.rol === "admin";

    const intervenciones = await new Promise((resolve, reject) => {
      if (isAdmin || !nombreTerapeuta) {
        db.all(
          "SELECT * FROM intervenciones ORDER BY id DESC",
          [],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      } else {
        db.all(
          "SELECT * FROM intervenciones WHERE terapeuta = ? ORDER BY id DESC",
          [nombreTerapeuta],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      }
    });

    // Agrupar por paciente
    const pacientesMap = {};
    intervenciones.forEach((item) => {
      const nombre = (item.paciente || "Sin nombre").trim() || "Sin nombre";
      if (!pacientesMap[nombre]) pacientesMap[nombre] = [];
      pacientesMap[nombre].push(item);
    });

    // Construir patientGroups con resumen en caché (no regenerar en dashboard)
    const patientGroups = await Promise.all(
      Object.entries(pacientesMap).map(async ([paciente, registros]) => {
        let summary = await loadSummary(paciente);
        if (!summary) {
          summary = await buildPatientSummaryAsync(paciente, registros);
          await persistSummary(paciente, summary);
        }
        // Fecha más reciente
        const ultimaFecha =
          registros[0] && registros[0].fecha ? registros[0].fecha : null;
        return { paciente, count: registros.length, summary, ultimaFecha };
      })
    );

    const flashSuccess = req.session.flashSuccess || null;
    req.session.flashSuccess = null;

    return res.render("dashboard", {
      usuario,
      patientGroups,
      isAdmin,
      flashSuccess,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("No se pudieron cargar los datos del dashboard");
  }
});

/* ══════════════════════════════════════════════════════════
   GET /intervenciones/paciente/:nombre
   Dashboard individual de un paciente con resumen IA completo
   ══════════════════════════════════════════════════════════ */
router.get("/paciente/:nombre", requireAuth, async (req, res) => {
  try {
    const paciente = decodeURIComponent(req.params.nombre);
    const usuario =
      req.session.terapeuta || req.session.usuario || null;
    const nombreTerapeuta =
      usuario && usuario.nombre ? usuario.nombre : "Terapeuta";

    // Cargar todos los registros del paciente
    const registros = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM intervenciones WHERE paciente = ? ORDER BY id DESC",
        [paciente],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    // Generar resumen IA y persistir
    const summary = await buildPatientSummaryAsync(paciente, registros);
    await persistSummary(paciente, summary);

    return res.render("dashboardPaciente", {
      paciente,
      registros,
      summary,
      terapeuta: nombreTerapeuta,
      usuario,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("No se pudo cargar el dashboard del paciente");
  }
});

module.exports = router;