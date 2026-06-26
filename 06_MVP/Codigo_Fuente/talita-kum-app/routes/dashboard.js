const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildPatientSummaryAsync, parseSummarySections } = require("../utils/ia");
const { persistSummary, loadSummary } = require("../utils/summaryCache");

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const usuario = req.session.terapeuta || req.session.usuario || null;
    const nombreTerapeuta = usuario && usuario.nombre ? usuario.nombre : null;
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

    const pacientesMap = {};
    intervenciones.forEach((item) => {
      const nombre = (item.paciente || "Sin nombre").trim() || "Sin nombre";
      if (!pacientesMap[nombre]) pacientesMap[nombre] = [];
      pacientesMap[nombre].push(item);
    });

    const patientGroups = await Promise.all(
      Object.entries(pacientesMap).map(async ([paciente, registros]) => {
        let summary = await loadSummary(paciente);
        if (!summary) {
          summary = await buildPatientSummaryAsync(paciente, registros);
          await persistSummary(paciente, summary);
        }
        const ultimaFecha = registros[0] && registros[0].fecha ? registros[0].fecha : null;
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

router.get("/paciente/:nombre", requireAuth, async (req, res) => {
  try {
    const paciente = decodeURIComponent(req.params.nombre);
    const usuario = req.session.terapeuta || req.session.usuario || null;
    const nombreTerapeuta = usuario && usuario.nombre ? usuario.nombre : "Terapeuta";
    const isAdmin = usuario && usuario.rol === "admin";

    const registros = await new Promise((resolve, reject) => {
      if (isAdmin) {
        db.all(
          "SELECT * FROM intervenciones WHERE paciente = ? ORDER BY id DESC",
          [paciente],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      } else {
        db.all(
          "SELECT * FROM intervenciones WHERE paciente = ? AND terapeuta = ? ORDER BY id DESC",
          [paciente, nombreTerapeuta],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      }
    });

    if (!isAdmin && registros.length === 0) {
      return res.status(403).send("No autorizado");
    }

    const summary = await buildPatientSummaryAsync(paciente, registros);
    await persistSummary(paciente, summary);
    const sections = parseSummarySections(summary);

    return res.render("dashboardPaciente", {
      paciente,
      registros,
      summary,
      sections,
      terapeuta: nombreTerapeuta,
      usuario,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("No se pudo cargar el dashboard del paciente");
  }
});

module.exports = router;
