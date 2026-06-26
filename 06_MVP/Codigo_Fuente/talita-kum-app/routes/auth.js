const express = require("express");
const db = require("../config/db");
const {
  hashPassword,
  isPasswordHash,
  verifyPassword,
  isLegacyPlaintextMatch,
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
    return res.render("loginAdmin", { error: "Complete correo y contraseña" });
  }

  db.get("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.render("loginAdmin", { error: "No se pudo validar el usuario" });
    }

    if (!usuario) {
      return res.render("loginAdmin", { error: "Credenciales inválidas" });
    }

    const validPassword = isPasswordHash(usuario.password)
      ? verifyPassword(password, usuario.password)
      : isLegacyPlaintextMatch(password, usuario.password);

    if (!validPassword) {
      return res.render("loginAdmin", { error: "Credenciales inválidas" });
    }

    if (isLegacyPlaintextMatch(password, usuario.password)) {
      db.run("UPDATE usuarios SET password = ? WHERE id = ?", [hashPassword(password), usuario.id]);
    }

    req.session.usuario = usuario;
    return res.redirect("/intervenciones/dashboard");
  });
});

router.post("/login", (req, res) => {
  const correo = (req.body.correo || "").trim();
  const password = (req.body.password || "").trim();

  if (!correo || !password) {
    return res.render("login", { error: "Complete correo y contraseña" });
  }

  db.get("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.render("login", { error: "No se pudo validar el usuario" });
    }

    if (!usuario) {
      return res.render("login", { error: "Credenciales inválidas" });
    }

    const validPassword = isPasswordHash(usuario.password)
      ? verifyPassword(password, usuario.password)
      : isLegacyPlaintextMatch(password, usuario.password);

    if (!validPassword) {
      return res.render("login", { error: "Credenciales inválidas" });
    }

    if (isLegacyPlaintextMatch(password, usuario.password)) {
      db.run("UPDATE usuarios SET password = ? WHERE id = ?", [hashPassword(password), usuario.id]);
    }

    req.session.usuario = usuario;
    return res.redirect("/intervenciones/dashboard");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/profesionales/login");
  });
});

module.exports = router;