require("dotenv").config();

const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const intervencionesRoutes = require("./routes/intervenciones");
const profesionalesRoutes = require("./routes/profesionales");
const voiceRoutes = require("./routes/voice");
const { startScheduledBackups } = require("./utils/backups");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    name: "talita.sid",
    secret: process.env.SESSION_SECRET || "talita-kum-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.use("/", authRoutes);
app.use("/intervenciones", dashboardRoutes);
app.use("/intervenciones", intervencionesRoutes);
app.use("/profesionales", profesionalesRoutes);
app.use("/api/voice", voiceRoutes);

app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

startScheduledBackups();
