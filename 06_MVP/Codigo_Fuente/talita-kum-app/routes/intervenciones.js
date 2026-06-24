const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/nueva", requireAuth, (req, res) => {
  res.render("nuevaIntervencion", { usuario: req.session.usuario });
});

router.post("/guardar", requireAuth, (req, res) => {
  const {
    paciente,
    terapeuta,
    fecha,
    descripcion,
    objetivo,
    acuerdos,
    observaciones,
  } = req.body;

  db.run(
    `INSERT INTO intervenciones (paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      paciente,
      terapeuta || (req.session.usuario && req.session.usuario.nombre) || "Terapeuta",
      fecha || new Date().toISOString().slice(0, 10),
      descripcion,
      objetivo,
      acuerdos,
      observaciones,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudo guardar la intervención");
      }

      return res.redirect("/intervenciones/dashboard");
    }
  );
});

module.exports = router;