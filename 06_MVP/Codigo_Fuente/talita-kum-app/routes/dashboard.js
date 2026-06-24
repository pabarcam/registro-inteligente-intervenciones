const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildPatientSummaryAsync } = require("../utils/ia");

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const intervenciones = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM intervenciones ORDER BY id DESC", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });

    const pacientes = {};
    intervenciones.forEach((item) => {
      const nombre = (item.paciente || "Sin nombre").trim() || "Sin nombre";
      if (!pacientes[nombre]) {
        pacientes[nombre] = [];
      }
      pacientes[nombre].push(item);
    });

    const summaries = await Promise.all(
      Object.entries(pacientes).map(async ([paciente, registros]) => ({
        paciente,
        count: registros.length,
        resumen: await buildPatientSummaryAsync(paciente, registros),
      }))
    );

    return res.render("dashboard", {
      usuario: req.session.usuario,
      intervenciones,
      summaries,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("No se pudieron cargar las intervenciones");
  }
});

module.exports = router;