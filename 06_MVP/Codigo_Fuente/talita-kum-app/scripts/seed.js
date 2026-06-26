const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "..", "database", "database.db");
const db = new sqlite3.Database(dbPath);

const hash = bcrypt.hashSync("Terapeuta.1", 12);

const terapeutas = [
  { nombre: "Laura Mendoza", correo: "laura.mendoza@talita.com", especialidad: "Terapia cognitivo-conductual" },
  { nombre: "Carlos Rivera", correo: "carlos.rivera@talita.com", especialidad: "Terapia familiar sistémica" },
];

const pacientes = [
  { nombre: "Sofia Herrera", terapeuta: "Laura Mendoza" },
  { nombre: "Mateo Contreras", terapeuta: "Laura Mendoza" },
  { nombre: "Valentina Muñoz", terapeuta: "Carlos Rivera" },
  { nombre: "Benjamín Soto", terapeuta: "Carlos Rivera" },
];

const intervenciones = [
  { paciente: "Sofia Herrera", terapeuta: "Laura Mendoza", fecha: "2026-06-01", descripcion: "Primera sesion de evaluacion. Sofia reporta ansiedad generalizada desde hace 3 meses, con dificultades para conciliar el sueno y rumiacion excesiva sobre el rendimiento laboral. Se aplica inventario de ansiedad de Beck (BAI) con puntuacion de 24 (ansiedad moderada).", objetivo: "Establecer linea base de sintomas ansiosos e identificar pensamientos automaticos recurrentes.", acuerdos: "Registro diario de pensamientos automaticos en plantilla proporcionada. Practica de respiracion diafragmatica 2 veces al dia.", observaciones: "Buena disposicion y colaboracion. Se observa apertura para explorar patrones cognitivos." },
  { paciente: "Sofia Herrera", terapeuta: "Laura Mendoza", fecha: "2026-06-08", descripcion: "Segunda sesion. Revision del registro de pensamientos. Se identifican distorsiones como catastrofizacion ('voy a perder mi trabajo') y lectura de mente ('mi jefe piensa que soy incompetente'). Se introduce tecnica de reestructuracion cognitiva con el registro ABC de Ellis.", objetivo: "Identificar distorsiones cognitivas y practicar reestructuracion con evidencia objetiva.", acuerdos: "Continuar registro ABC diario. Aplicar tecnica de flecha descendente ante el pensamiento 'no soy suficiente'.", observaciones: "La paciente logro identificar al menos 3 distorsiones por si misma durante la sesion." },
  { paciente: "Sofia Herrera", terapeuta: "Laura Mendoza", fecha: "2026-06-15", descripcion: "Tercera sesion. Sofia reporta disminucion de la intensidad de la ansiedad (BAI: 18). Ha estado usando la respiracion diafragmatica antes de dormir con resultados positivos. Continua trabajando en reestructuracion cognitiva. Se introduce jerarquia de exposicion para ansiedad social en el trabajo.", objetivo: "Reforzar habilidades de reestructuracion e iniciar exposicion gradual a situaciones laborales temidas.", acuerdos: "Iniciar con exposicion en imaginacion al escenario de hablar en reunion semanal. Practicar respiracion antes de la exposicion.", observaciones: "Progreso consistente. La paciente reporta sentirse 'con mas herramientas' para manejar la ansiedad." },
  { paciente: "Mateo Contreras", terapeuta: "Laura Mendoza", fecha: "2026-06-03", descripcion: "Sesion inicial. Mateo, 34 anos, consulta por episodios depresivos recurrentes. Presenta aislamiento social, anhedonia y baja energia. PHQ-9 puntua 16 (depresion moderada). Refiere haber abandonado actividades que antes disfrutaba.", objetivo: "Evaluar estado de animo actual e iniciar psicoeducacion en activacion conductual.", acuerdos: "Programacion semanal de 3 actividades placenteras minimo. Monitoreo diario del estado de animo con escala 1-10.", observaciones: "Motivacion para el cambio. Expresa frustracion por el tiempo que ha estado 'sin hacer nada'." },
  { paciente: "Valentina Munoz", terapeuta: "Carlos Rivera", fecha: "2026-06-02", descripcion: "Primera entrevista. Valentina, 28 anos, derivada por medico cabecera por sintomas de estres post-traumatico luego de accidente automovilistico hace 6 meses. Presenta pesadillas recurrentes, hipervigilancia y evitacion de conducir.", objetivo: "Evaluacion inicial y psicoeducacion sobre respuesta al trauma. Estabilizar sintomas.", acuerdos: "Tecnica de enraizamiento sensorial (5-4-3-2-1) para momentos de hiperactivacion. No se asigna exposicion todavia.", observaciones: "Paciente colaboradora pero visiblemente angustiada al relatar el accidente. Se prioriza seguridad y estabilizacion." },
  { paciente: "Valentina Munoz", terapeuta: "Carlos Rivera", fecha: "2026-06-09", descripcion: "Segunda sesion. Valentina reporta haber tenido 3 pesadillas en la ultima semana. Se ha sentido 'al limite' en el trabajo. Practico enraizamiento 2 veces con exito parcial. Se introduce psicoeducacion sobre el ciclo del miedo y la evitacion.", objetivo: "Psicoeducacion sobre evitacion como mantenedor del miedo. Introducir jerarquia de exposicion.", acuerdos: "Elaborar lista de situaciones evitadas desde el accidente (jerarquia). Practicar respiracion lenta al despertar de pesadillas.", observaciones: "Dificultad para hablar del accidente. Se respeta su ritmo y se refuerza la alianza terapeutica." },
  { paciente: "Benjamín Soto", terapeuta: "Carlos Rivera", fecha: "2026-06-05", descripcion: "Primera consulta. Benjamin, 42 anos, derivado por su esposa por conflictos familiares y dificultades en la comunicacion con su hijo adolescente. Refiere sentir que 'perdio el control' de la casa y reacciona con ira ante la desobediencia.", objetivo: "Evaluar dinamica familiar y patrones de comunicacion. Psicoeducacion sobre respuesta emocional.", acuerdos: "Registro de situaciones que disparan ira (evento, pensamiento, conducta). Lectura de psicoeducacion sobre triangulacion familiar.", observaciones: "Conciencia de que su reaccion no esta siendo efectiva. Muestra disposicion al cambio aunque con resistencia a 'ceder' autoridad." },
  { paciente: "Benjamín Soto", terapeuta: "Carlos Rivera", fecha: "2026-06-12", descripcion: "Segunda sesion. Benjamin trae el registro completo. Identifica que sus pensamientos automaticos incluyen 'me falta el respeto' y 'ya no tengo autoridad'. Se trabaja reestructuracion cognitiva en estos pensamientos. Se introduce comunicacion no violenta (CNV) como herramienta.", objetivo: "Reestructurar pensamientos de amenaza a la autoridad. Entrenar en habilidades de comunicacion no violenta.", acuerdos: "Practicar CNV en al menos una interaccion diaria con su hijo. Continuar registro de pensamientos.", observaciones: "Progreso significativo. Reporta haber tenido una conversacion 'diferente' con su hijo donde no termino en gritos." },
];

db.serialize(() => {
  const insertTerapeuta = db.prepare("INSERT OR IGNORE INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, 1)");
  const insertPaciente = db.prepare("INSERT OR IGNORE INTO pacientes (nombre) VALUES (?)");
  const insertIntervencion = db.prepare("INSERT INTO intervenciones (paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)");

  terapeutas.forEach((t) => {
    insertTerapeuta.run(t.nombre, t.correo, hash, t.especialidad);
  });

  pacientes.forEach((p) => {
    insertPaciente.run(p.nombre);
  });

  intervenciones.forEach((i) => {
    insertIntervencion.run(i.paciente, i.terapeuta, i.fecha, i.descripcion, i.objetivo, i.acuerdos, i.observaciones);
  });

  insertTerapeuta.finalize();
  insertPaciente.finalize();
  insertIntervencion.finalize();

  console.log("Seed completado:");
  console.log(`  - ${terapeutas.length} terapeutas`);
  console.log(`  - ${pacientes.length} pacientes`);
  console.log(`  - ${intervenciones.length} intervenciones`);
  console.log("Contrasena para terapeutas: Terapeuta.1");
});

db.close();
