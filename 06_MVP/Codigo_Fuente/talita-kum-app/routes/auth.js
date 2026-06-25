const express = require("express");
const db = require("../config/db");
const {
  hashPassword,
  isLegacyPlaintextMatch,
  stripPassword,
  verifyPassword,
} = require("../utils/passwords");

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
    return res.render("loginAdmin", { error: "Complete correo y contrasena" });
  }

  db.get("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.render("loginAdmin", { error: "No se pudo validar el usuario" });
    }

    const validPassword =
      usuario &&
      (verifyPassword(password, usuario.password) ||
        isLegacyPlaintextMatch(password, usuario.password));

    if (!validPassword) {
      return res.render("loginAdmin", { error: "Credenciales invalidas" });
    }

    if (isLegacyPlaintextMatch(password, usuario.password)) {
      db.run("UPDATE usuarios SET password = ? WHERE id = ?", [hashPassword(password), usuario.id]);
    }

    return req.session.regenerate((sessionErr) => {
      if (sessionErr) {
        console.error(sessionErr);
        return res.render("loginAdmin", { error: "No se pudo iniciar la sesion" });
      }

      req.session.usuario = stripPassword(usuario);
      return res.redirect("/intervenciones/dashboard");
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
