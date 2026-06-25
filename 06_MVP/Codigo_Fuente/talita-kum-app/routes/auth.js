const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/profesionales/login");
});

router.get("/login-admin", (req, res) => {
  res.render("loginAdmin", { error: null });
});

router.post("/login-admin", (req, res) => {
  const correo = (req.body.correo || "").trim();
  const password = (req.body.password || "").trim();

  if (!correo || !password) {
    return res.render("loginAdmin", { error: "Complete correo y contraseña" });
  }

  db.get(
    "SELECT * FROM usuarios WHERE correo = ? AND password = ?",
    [correo, password],
    (err, usuario) => {
      if (err) {
        console.error(err);
        return res.render("loginAdmin", { error: "No se pudo validar el usuario" });
      }

      if (!usuario) {
        return res.render("loginAdmin", { error: "Credenciales inválidas" });
      }

      req.session.usuario = usuario;
      return res.redirect("/intervenciones/dashboard");
    }
  );
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;