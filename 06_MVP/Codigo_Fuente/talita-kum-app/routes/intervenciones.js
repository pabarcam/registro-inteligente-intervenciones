const express = require("express");
const path = require("path");
const multer = require("multer");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildPatientSummaryAsync } = require("../utils/ia");
const { persistSummary, clearSummary } = require("../utils/summaryCache");
const { enviarCorreoIntervencion } = require("../utils/mailer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".webm";
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get("/nueva", requireAuth, (req, res) => {
  const usuario = req.session.terapeuta || req.session.usuario || null;
  res.render("nuevaIntervencion", { usuario });
});

router.post("/guardar", requireAuth, upload.single("audio"), async (req, res) => {
  const {
    paciente,
    terapeuta,
    fecha,
    descripcion,
    objetivo,
    acuerdos,
    observaciones,
  } = req.body;

  const sessionUser = req.session.terapeuta || req.session.usuario || null;
  const nombreTerapeuta =
    terapeuta ||
    (sessionUser && sessionUser.nombre) ||
    "Terapeuta";
  const correoTerapeuta = sessionUser && sessionUser.correo ? sessionUser.correo : null;
  const fechaFinal = fecha || new Date().toISOString().slice(0, 10);
  const pacienteFinal = (paciente || "").trim();

  if (!pacienteFinal) {
    return res.status(400).send("El nombre del paciente es obligatorio");
  }

  const partes = pacienteFinal.split(/\s+/);
  if (partes.length < 3) {
    return res.status(400).send("Debe ingresar nombre y ambos apellidos del paciente");
  }

  const audioPath = req.file ? "/uploads/" + req.file.filename : null;

  db.run(
    `INSERT INTO intervenciones (paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones, audio_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pacienteFinal,
      nombreTerapeuta,
      fechaFinal,
      descripcion || "",
      objetivo || "",
      acuerdos || "",
      observaciones || "",
      audioPath,
    ],
    async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudo guardar la intervencion");
      }

      let resumenIA = "";
      try {
        await clearSummary(pacienteFinal);
        const registros = await new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM intervenciones WHERE paciente = ? ORDER BY id ASC",
            [pacienteFinal],
            (e, rows) => (e ? reject(e) : resolve(rows || []))
          );
        });
        resumenIA = await buildPatientSummaryAsync(pacienteFinal, registros);
        await persistSummary(pacienteFinal, resumenIA);
      } catch (iaErr) {
        console.error("[guardar] No se pudo generar resumen IA:", iaErr.message);
        resumenIA = "No disponible en este momento.";
      }

      if (correoTerapeuta) {
        const audioFullPath = req.file ? path.join(__dirname, "..", "uploads", req.file.filename) : null;
        enviarCorreoIntervencion({
          destinatario: correoTerapeuta,
          terapeuta: nombreTerapeuta,
          paciente: pacienteFinal,
          fecha: fechaFinal,
          descripcion: descripcion || "",
          resumenIA,
          audioPath: audioFullPath,
        }).then((result) => {
          if (!result.ok) {
            console.warn("[guardar] Correo no enviado:", result.razon);
          }
        });
      }

      req.session.flashSuccess = "Intervencion guardada con exito";
      return res.redirect("/intervenciones/dashboard");
    }
  );
});

// ── API: Autocomplete pacientes ────────────────────────────
router.get("/api/pacientes", requireAuth, (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  db.all(
    "SELECT DISTINCT paciente AS nombre FROM intervenciones WHERE paciente LIKE ? ORDER BY paciente LIMIT 10",
    [`%${q}%`],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows || []);
    }
  );
});

// ── Eliminar intervención ─────────────────────────────────
router.post("/eliminar/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM intervenciones WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).json({ ok: false, error: "Intervencion no encontrada" });

    if (req.session.terapeuta && row.terapeuta !== req.session.terapeuta.nombre) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    if (!req.session.terapeuta && !(req.session.usuario && req.session.usuario.rol === "admin")) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    db.run("DELETE FROM intervenciones WHERE id = ?", [id], (delErr) => {
      if (delErr) return res.status(500).json({ ok: false, error: "No se pudo eliminar" });

      clearSummary(row.paciente);
      res.json({ ok: true });
    });
  });
});

// ── Editar intervención ───────────────────────────────────
router.post("/editar/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ ok: false, error: "La descripcion es obligatoria" });
  }

  db.get("SELECT * FROM intervenciones WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).json({ ok: false, error: "Intervencion no encontrada" });

    if (req.session.terapeuta && row.terapeuta !== req.session.terapeuta.nombre) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    db.run("UPDATE intervenciones SET descripcion = ? WHERE id = ?", [descripcion.trim(), id], async (updErr) => {
      if (updErr) return res.status(500).json({ ok: false, error: "No se pudo actualizar" });

      try {
        await clearSummary(row.paciente);
        const registros = await new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM intervenciones WHERE paciente = ? ORDER BY id ASC",
            [row.paciente],
            (e, rows) => (e ? reject(e) : resolve(rows || []))
          );
        });
        const resumenIA = await buildPatientSummaryAsync(row.paciente, registros);
        await persistSummary(row.paciente, resumenIA);
      } catch (iaErr) {
        console.warn("[editar] No se pudo regenerar resumen IA:", iaErr.message);
      }

      res.json({ ok: true });
    });
  });
});

module.exports = router;
