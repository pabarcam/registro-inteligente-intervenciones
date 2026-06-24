const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("login");
});

router.post("/login", (req, res) => {

    const correo = req.body.correo;

    req.session.usuario = correo;

    res.redirect("/intervenciones/dashboard");
});

module.exports = router;