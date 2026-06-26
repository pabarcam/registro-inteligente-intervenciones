const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const {
  hashPassword,
  isLegacyPlaintextMatch,
  stripPassword,
  validatePasswordPolicy,
  verifyPassword,
} = require("../utils/passwords");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("loginProfesional", { error: null, message: null });
});

router.post("/login", (req, res) => {
  const correo = (req.body.correo || "").trim();
  const password = (req.body.password || "").trim();

  if (!correo || !password) {
    return res.render("loginProfesional", { error: "Complete correo y contrasena", message: null });
  }

  db.get("SELECT * FROM terapeutas WHERE correo = ?", [correo], (err, terapeuta) => {
    if (err) {
      console.error(err);
      return res.render("loginProfesional", { error: "No se pudo validar el terapeuta", message: null });
    }

    const validPassword =
      terapeuta &&
      (verifyPassword(password, terapeuta.password) ||
        isLegacyPlaintextMatch(password, terapeuta.password));

    if (!validPassword) {
      return res.render("loginProfesional", { error: "Credenciales invalidas", message: null });
    }

    if (terapeuta.aprobado !== 1) {
      return res.render("loginProfesional", {
        error: "Tu cuenta aun no ha sido aprobada por el administrador.",
        message: null,
      });
    }

    if (isLegacyPlaintextMatch(password, terapeuta.password)) {
      db.run("UPDATE terapeutas SET password = ? WHERE id = ?", [hashPassword(password), terapeuta.id]);
    }

    return req.session.regenerate((sessionErr) => {
      if (sessionErr) {
        console.error(sessionErr);
        return res.render("loginProfesional", { error: "No se pudo iniciar la sesion", message: null });
      }

      req.session.terapeuta = stripPassword(terapeuta);
      return res.redirect("/intervenciones/dashboard");
    });
  });
});

router.get("/registro", (req, res) => {
  res.render("registroProfesional", { error: null, message: null });
});

router.post("/registro", (req, res) => {
  const { nombre, correo, password, confirmarPassword, especialidad } = req.body;
  const nombreTrim = (nombre || "").trim();
  const correoTrim = (correo || "").trim().toLowerCase();
  const passwordTrim = (password || "").trim();
  const confirmarPasswordTrim = (confirmarPassword || "").trim();
  const especialidadTrim = (especialidad || "").trim();

  if (!nombreTrim || !correoTrim || !passwordTrim || !confirmarPasswordTrim || !especialidadTrim) {
    return res.render("registroProfesional", {
      error: "Complete todos los campos",
      message: null,
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoTrim)) {
    return res.render("registroProfesional", {
      error: "Ingrese un correo institucional válido.",
      message: null,
    });
  }

  if (passwordTrim !== confirmarPasswordTrim) {
    return res.render("registroProfesional", {
      error: "Las contraseñas no coinciden.",
      message: null,
    });
  }

  if (!validatePasswordPolicy(passwordTrim)) {
    return res.render("registroProfesional", {
      error: "La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y símbolo.",
      message: null,
    });
  }

  db.run(
    "INSERT INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, 0)",
    [nombreTrim, correoTrim, hashPassword(passwordTrim), especialidadTrim],
    (err) => {
      if (err) {
        console.error(err);
        return res.render("registroProfesional", {
          error: "No se pudo crear la cuenta. Revise que el correo no este en uso.",
          message: null,
        });
      }

      return res.render("registroProfesional", {
        error: null,
        message: "Registro enviado. El administrador debera aprobar su cuenta.",
      });
    }
  );
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/profesionales/login");
  });
});

router.get("/historial", requireAuth, (req, res) => {
  const terapeutaNombre = req.session.terapeuta ? req.session.terapeuta.nombre : "";

  db.all(
    "SELECT * FROM intervenciones WHERE terapeuta = ? ORDER BY id ASC",
    [terapeutaNombre],
    (err, intervenciones) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudieron cargar los historiales");
      }

      const rows = intervenciones || [];
      const counts = {};

      rows.forEach((item) => {
        const p = item.paciente || "Sin nombre";
        counts[p] = (counts[p] || 0) + 1;
        item.sesionNumber = counts[p];
      });

      rows.reverse();

      return res.render("historialProfesional", {
        terapeuta: req.session.terapeuta,
        intervenciones: rows,
      });
    }
  );
});

router.get("/admin", requireAuth, (req, res) => {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(403).send("No autorizado");
  }

  db.all(
    "SELECT id, nombre, correo, especialidad, aprobado FROM terapeutas ORDER BY id DESC",
    [],
    (err, terapeutas) => {
      if (err) {
        console.error(err);
        return res.status(500).send("No se pudieron cargar las cuentas");
      }

      db.all("SELECT * FROM intervenciones ORDER BY id DESC", [], (error, intervenciones) => {
        if (error) {
          console.error(error);
          return res.status(500).send("No se pudieron cargar las intervenciones");
        }

        return res.render("adminPanel", {
          profesionales: terapeutas || [],
          intervenciones: intervenciones || [],
        });
      });
    }
  );
});

router.post("/admin/aprobar/:id", requireAuth, (req, res) => {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(403).send("No autorizado");
  }

  db.run("UPDATE terapeutas SET aprobado = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("No se pudo aprobar la cuenta");
    }

    return res.redirect("/profesionales/admin");
  });
});

router.post("/admin/eliminar/:id", requireAuth, (req, res) => {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(403).send("No autorizado");
  }

  db.run("DELETE FROM terapeutas WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("No se pudo eliminar la cuenta");
    }

    return res.redirect("/profesionales/admin");
  });
});

module.exports = router;
