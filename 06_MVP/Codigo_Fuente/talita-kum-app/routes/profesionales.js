const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("loginProfesional", { error: null, message: null });
});

router.post("/login", (req, res) => {
  const correo = (req.body.correo || "").trim();
  const password = (req.body.password || "").trim();

  if (!correo || !password) {
    return res.render("loginProfesional", { error: "Complete correo y contraseña", message: null });
  }

  db.get(
    "SELECT * FROM terapeutas WHERE correo = ? AND password = ?",
    [correo, password],
    (err, terapeuta) => {
      if (err) {
        console.error(err);
        return res.render("loginProfesional", { error: "No se pudo validar el terapeuta", message: null });
      }

      if (!terapeuta) {
        return res.render("loginProfesional", { error: "Credenciales inválidas", message: null });
      }

      if (terapeuta.aprobado !== 1) {
        return res.render("loginProfesional", { error: "Tu cuenta aún no ha sido aprobada por el administrador.", message: null });
      }

      req.session.terapeuta = terapeuta;
      return res.redirect("/intervenciones/dashboard");
    }
  );
});

router.get("/registro", (req, res) => {
  res.render("registroProfesional", { error: null, message: null });
});

router.post("/registro", (req, res) => {
  const { nombre, correo, password, especialidad } = req.body;

  if (!nombre || !correo || !password || !especialidad) {
    return res.render("registroProfesional", { error: "Complete todos los campos", message: null });
  }

  db.run(
    "INSERT INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, 0)",
    [nombre, correo, password, especialidad],
    (err) => {
      if (err) {
        console.error(err);
        return res.render("registroProfesional", { error: "No se pudo crear la cuenta. Revise que el correo no esté en uso.", message: null });
      }

      return res.render("registroProfesional", { error: null, message: "Registro enviado. El administrador deberá aprobar su cuenta." });
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
      
      rows.forEach(item => {
        const p = item.paciente || 'Sin nombre';
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

  db.all("SELECT * FROM terapeutas ORDER BY id DESC", [], (err, terapeutas) => {
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
  });
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

    db.get("SELECT * FROM terapeutas WHERE id = ?", [req.params.id], (selectErr, terapeuta) => {
      if (selectErr) {
        console.error(selectErr);
        return res.status(500).send("No se pudo verificar la aprobación");
      }

      console.log("Cuenta aprobada:", terapeuta);
      return res.redirect("/profesionales/admin");
    });
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
