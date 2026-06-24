const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", requireAuth, (req, res) => {
  db.all("SELECT * FROM intervenciones ORDER BY id DESC", [], (err, intervenciones) => {
    if (err) {
      console.error(err);
      return res.status(500).send("No se pudieron cargar las intervenciones");
    }

    return res.render("dashboard", {
      usuario: req.session.usuario,
      intervenciones: intervenciones || [],
    });
  });
});

module.exports = router;