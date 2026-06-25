const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildPatientSummaryAsync } = require("../utils/ia");
const { enviarCorreoIntervencion } = require("../utils/mailer");

const router = express.Router();

/* ── GET /intervenciones/nueva ───────────────────────────── */
router.get("/nueva", requireAuth, (req, res) => {
  const usuario = req.session.terapeuta || req.session.usuario || null;
  const flashError = req.session.flashError || null;
  req.session.flashError = null;

  res.render("nuevaIntervencion", { usuario, flashError });
});

/* ── POST /intervenciones/guardar ────────────────────────── */
router.post("/guardar", requireAuth, async (req, res) => {
  const { paciente, terapeuta, fecha, descripcion } = req.body;

  const nombreTerapeuta =
    terapeuta ||
    (req.session.usuario && req.session.usuario.nombre) ||
    (req.session.terapeuta && req.session.terapeuta.nombre) ||
    "Terapeuta";

  const fechaFinal = fecha || new Date().toISOString().slice(0, 10);

  // Correo del terapeuta desde la sesión
  const correoTerapeuta =
    (req.session.terapeuta && req.session.terapeuta.correo) ||
    (req.session.usuario && req.session.usuario.correo) ||
    null;

  /* ── Función interna que guarda y luego envía email ── */
  const saveAndNotify = async (audioPath) => {
    db.run(
      `INSERT INTO intervenciones
         (paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones, audio_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente, nombreTerapeuta, fechaFinal, descripcion, "", "", "", audioPath],
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("No se pudo guardar la intervención");
        }

        req.session.borrarSintesis = false;

        /* ── Generar resumen IA de las intervenciones del paciente ── */
        let resumenIA = "";
        try {
          const registros = await new Promise((resolve, reject) => {
            db.all(
              "SELECT * FROM intervenciones WHERE paciente = ? ORDER BY id DESC",
              [paciente],
              (e, rows) => (e ? reject(e) : resolve(rows || []))
            );
          });
          resumenIA = await buildPatientSummaryAsync(paciente, registros);
        } catch (iaErr) {
          console.error("[guardar] No se pudo generar resumen IA:", iaErr.message);
          resumenIA = "No disponible en este momento.";
        }

        /* ── Enviar correo al terapeuta ── */
        if (correoTerapeuta) {
          const absAudioPath = audioPath
            ? path.join(__dirname, "..", audioPath)
            : null;

          enviarCorreoIntervencion({
            destinatario: correoTerapeuta,
            terapeuta: nombreTerapeuta,
            paciente,
            fecha: fechaFinal,
            descripcion,
            resumenIA,
            audioPath: absAudioPath,
          }).then((result) => {
            if (!result.ok) {
              console.warn("[guardar] Correo no enviado:", result.razon);
            }
          });
        } else {
          console.warn("[guardar] No se encontró correo del terapeuta en sesión.");
        }

        // Redirigir al dashboard con mensaje de éxito
        req.session.flashSuccess = "✅ Intervención guardada con éxito";
        return res.redirect("/intervenciones/dashboard");
      }
    );
  };

  // Validar y registrar paciente
  const checkPatientAndSave = (audioPath) => {
    const pacienteStr = paciente.trim();
    const partesNombre = pacienteStr.split(/\s+/);

    db.get("SELECT * FROM pacientes WHERE LOWER(nombre) = LOWER(?)", [pacienteStr], (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error de base de datos");
      }

      if (!row) {
        // Paciente nuevo, requiere nombre y dos apellidos (3 palabras)
        if (partesNombre.length < 3) {
          req.session.flashError = "Para registrar un nuevo paciente, debe ingresar su nombre y ambos apellidos.";
          return res.redirect("/intervenciones/nueva");
        }

        db.run("INSERT INTO pacientes (nombre) VALUES (?)", [pacienteStr], function(err) {
          if (err) {
            console.error(err);
            return res.status(500).send("Error al crear paciente");
          }
          saveAndNotify(audioPath);
        });
      } else {
        // Paciente existente
        saveAndNotify(audioPath);
      }
    });
  };

  /* ── Manejar archivo de audio ── */
  if (req.files && req.files.audio) {
    const file = req.files.audio;
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(uploadDir, fileName);
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error(err);
        checkPatientAndSave(null);
        return;
      }
      checkPatientAndSave(`/uploads/${fileName}`);
    });
    return;
  }

  checkPatientAndSave(null);
});

/* ── GET /intervenciones/api/pacientes ───────────────────── */
router.get("/api/pacientes", requireAuth, (req, res) => {
  const query = (req.query.q || "").trim().toLowerCase();
  if (!query) return res.json([]);

  // Si busca por iniciales o nombre
  db.all("SELECT id, nombre FROM pacientes WHERE LOWER(nombre) LIKE ? ORDER BY nombre ASC", [`%${query}%`], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en BD" });
    }
    return res.json(rows || []);
  });
});

/* ── POST /intervenciones/borrar-sintesis ────────────────── */
router.post("/borrar-sintesis", requireAuth, (req, res) => {
  if (req.session.usuario && req.session.usuario.rol === "admin") {
    db.run("DELETE FROM resumenes", [], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudo borrar las síntesis");
      }
      req.session.borrarSintesis = true;
      return res.redirect("/intervenciones/dashboard");
    });
    return;
  }
  return res.status(403).send("No autorizado");
});

/* ── POST /intervenciones/borrar-todos ───────────────────── */
router.post("/borrar-todos", requireAuth, (req, res) => {
  if (req.session.usuario && req.session.usuario.rol === "admin") {
    db.run("DELETE FROM intervenciones", [], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudieron borrar las intervenciones");
      }
      db.run("DELETE FROM resumenes", [], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).send("No se pudieron borrar las síntesis");
        }
        req.session.borrarSintesis = true;
        return res.redirect("/intervenciones/dashboard");
      });
    });
    return;
  }
  return res.status(403).send("No autorizado");
});

/* ── POST /intervenciones/editar/:id ───────────────────── */
router.post("/editar/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;
  
  const isAdmin = req.session.usuario && req.session.usuario.rol === "admin";
  const terapeuta = req.session.terapeuta ? req.session.terapeuta.nombre : null;

  if (isAdmin || terapeuta) {
    db.run("UPDATE intervenciones SET descripcion = ? WHERE id = ?", [descripcion, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudo editar la intervención");
      }
      return res.redirect("back");
    });
  } else {
    return res.status(403).send("No autorizado");
  }
});

/* ── POST /intervenciones/eliminar/:id ───────────────────── */
router.post("/eliminar/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  
  const isAdmin = req.session.usuario && req.session.usuario.rol === "admin";
  const terapeuta = req.session.terapeuta ? req.session.terapeuta.nombre : null;

  if (isAdmin || terapeuta) {
    db.run("DELETE FROM intervenciones WHERE id = ?", [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudo eliminar la intervención");
      }
      req.session.borrarSintesis = false;
      return res.redirect("back");
    });
  } else {
    return res.status(403).send("No autorizado");
  }
});

module.exports = router;