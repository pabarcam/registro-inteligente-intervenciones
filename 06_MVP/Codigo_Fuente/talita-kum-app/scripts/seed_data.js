const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "database.db");
const db = new sqlite3.Database(dbPath);

const hash = bcrypt.hashSync("Clinica2025#", 12);

db.serialize(() => {
  db.run(
    "INSERT OR IGNORE INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, 1)",
    ["Dr. Carlos Mu\u00f1oz", "carlos@talita.com", hash, "Terapia Cognitivo-Conductual"]
  );

  db.run(
    "INSERT OR IGNORE INTO terapeutas (nombre, correo, password, especialidad, aprobado) VALUES (?, ?, ?, ?, 1)",
    ["Psic. Andrea Silva", "andrea@talita.com", hash, "Psicolog\u00eda Cl\u00ednica"]
  );

  const pacientes = [
    "Ana Mart\u00ednez L\u00f3pez",
    "Pedro S\u00e1nchez Vega",
    "Carolina Jim\u00e9nez Ruiz",
    "Luis Torres Medina",
    "Sof\u00eda Herrera Cruz",
    "Roberto D\u00edaz Paz",
  ];

  pacientes.forEach((nombre) => {
    db.run("INSERT OR IGNORE INTO pacientes (nombre) VALUES (?)", [nombre]);
  });

  const intervenciones = [
    {
      paciente: "Ana Mart\u00ednez L\u00f3pez",
      terapeuta: "Dr. Carlos Mu\u00f1oz",
      fecha: "2026-06-10",
      descripcion: "Primera sesi\u00f3n. Ana reporta ansiedad generalizada desde hace 3 meses. Dificultad para conciliar el sue\u00f1o y pensamientos recurrentes sobre su rendimiento laboral. Se realiza psicoeducaci\u00f3n sobre ansiedad y se introduce el modelo TCC.",
      objetivo: "Psicoeducaci\u00f3n sobre ansiedad y registro de pensamientos autom\u00e1ticos",
      acuerdos: "Llevar un diario de pensamientos autom\u00e1ticos durante la semana",
      observaciones: "Buena disposici\u00f3n. Se observa tensi\u00f3n muscular elevada.",
    },
    {
      paciente: "Ana Mart\u00ednez L\u00f3pez",
      terapeuta: "Dr. Carlos Mu\u00f1oz",
      fecha: "2026-06-17",
      descripcion: "Segunda sesi\u00f3n. Ana trajo el registro de pensamientos. Se identifican distorsiones cognitivas tipo catastrofizaci\u00f3n y sobregeneralizaci\u00f3n. Se trabaj\u00f3 reestructuraci\u00f3n cognitiva sobre el pensamiento de ser despedida.",
      objetivo: "Identificar y reestructurar distorsiones cognitivas",
      acuerdos: "Continuar con el registro y practicar la t\u00e9cnica de la flecha descendente",
      observaciones: "Progreso en la identificaci\u00f3n de pensamientos. A\u00fan ansiedad moderada.",
    },
    {
      paciente: "Ana Mart\u00ednez L\u00f3pez",
      terapeuta: "Dr. Carlos Mu\u00f1oz",
      fecha: "2026-06-24",
      descripcion: "Tercera sesi\u00f3n. Ana reporta mejora en la calidad del sue\u00f1o. Ha logrado identificar y cuestionar sus pensamientos catastr\u00f3ficos. Se introduce activaci\u00f3n conductual con actividades placenteras.",
      objetivo: "Activaci\u00f3n conductual y programaci\u00f3n de actividades agradables",
      acuerdos: "Programar 3 actividades placenteras para la semana y registrar el estado de \u00e1nimo antes y despu\u00e9s.",
      observaciones: "Disminuci\u00f3n de ansiedad de 8/10 a 5/10. Responde bien a la terapia.",
    },
    {
      paciente: "Pedro S\u00e1nchez Vega",
      terapeuta: "Dr. Carlos Mu\u00f1oz",
      fecha: "2026-06-12",
      descripcion: "Consulta inicial. Pedro presenta s\u00edntomas depresivos desde hace 2 meses: anhedonia, aislamiento social, fatiga constante. Se aplica escala PHQ-9 con puntuaci\u00f3n de 15 (depresi\u00f3n moderada).",
      objetivo: "Evaluaci\u00f3n inicial y establecimiento de objetivos terap\u00e9uticos",
      acuerdos: "Asistir a sesiones semanales. Registrar actividades diarias y estado de \u00e1nimo.",
      observaciones: "Riesgo suicida descartado. Motivaci\u00f3n baja pero colaborador.",
    },
    {
      paciente: "Pedro S\u00e1nchez Vega",
      terapeuta: "Dr. Carlos Mu\u00f1oz",
      fecha: "2026-06-19",
      descripcion: "Segunda sesi\u00f3n. Pedro report\u00f3 dificultad para realizar las actividades programadas por falta de energ\u00eda. Se trabaj\u00f3 en dividir tareas en pasos peque\u00f1os. Se identific\u00f3 pensamiento de todo o nada.",
      objetivo: "Activaci\u00f3n conductual gradual y reestructuraci\u00f3n de pensamiento polarizado",
      acuerdos: "Realizar al menos 2 actividades peque\u00f1as al d\u00eda. Registrar pensamientos autom\u00e1ticos.",
      observaciones: "Lento pero constante. Humor dist\u00edmico. Se refuerza la alianza terap\u00e9utica.",
    },
    {
      paciente: "Carolina Jim\u00e9nez Ruiz",
      terapeuta: "Psic. Andrea Silva",
      fecha: "2026-06-08",
      descripcion: "Primera sesi\u00f3n. Carolina acude por ataques de p\u00e1nico recurrentes. Reporte de 3 episodios en la \u00faltima semana con taquicardia, sudoraci\u00f3n y sensaci\u00f3n de muerte inminente. Se explica el ciclo del p\u00e1nico desde TCC.",
      objetivo: "Psicoeducaci\u00f3n sobre el p\u00e1nico y estrategias de respiraci\u00f3n diafragm\u00e1tica",
      acuerdos: "Practicar respiraci\u00f3n diafragm\u00e1tica 2 veces al d\u00eda. Registrar los episodios de p\u00e1nico.",
      observaciones: "Alta motivaci\u00f3n. Buen insight sobre su condici\u00f3n.",
    },
    {
      paciente: "Carolina Jim\u00e9nez Ruiz",
      terapeuta: "Psic. Andrea Silva",
      fecha: "2026-06-15",
      descripcion: "Reporta reducci\u00f3n de episodios a 1 por semana. Ha utilizado la respiraci\u00f3n diafragm\u00e1tica con resultados parciales. Se introduce la t\u00e9cnica de exposici\u00f3n interoceptiva.",
      objetivo: "Exposici\u00f3n interoceptiva y reestructuraci\u00f3n de pensamientos catastr\u00f3ficos",
      acuerdos: "Realizar ejercicios de exposici\u00f3n interoceptiva diarios. Continuar con el registro de p\u00e1nico.",
      observaciones: "Buena evoluci\u00f3n. La paciente comprende el mecanismo del p\u00e1nico.",
    },
    {
      paciente: "Carolina Jim\u00e9nez Ruiz",
      terapeuta: "Psic. Andrea Silva",
      fecha: "2026-06-22",
      descripcion: "Carolina ha tenido solo un episodio leve en la \u00faltima semana y logr\u00f3 manejarlo sin medicaci\u00f3n. La exposici\u00f3n interoceptiva fue bien tolerada. Se refuerza el autocontrol y se planifica el alta gradual.",
      objetivo: "Consolidaci\u00f3n de habilidades y prevenci\u00f3n de reca\u00eddas",
      acuerdos: "Continuar con exposici\u00f3n interoceptiva. Identificar se\u00f1ales de alerta temprana.",
      observaciones: "Mejor\u00eda significativa. Ansiedad disminuy\u00f3 de 9/10 a 3/10.",
    },
    {
      paciente: "Luis Torres Medina",
      terapeuta: "Psic. Andrea Silva",
      fecha: "2026-06-09",
      descripcion: "Primera sesi\u00f3n. Luis consulta por fobia social. Dificultad para hablar en p\u00fablico y en reuniones. Evita interacciones sociales por miedo al juicio negativo. Hace 2 a\u00f1os que no asiste a eventos familiares.",
      objetivo: "Evaluaci\u00f3n de fobia social y psicoeducaci\u00f3n sobre evitaci\u00f3n",
      acuerdos: "Jerarquizar situaciones sociales temidas. Iniciar registro de pensamientos en situaciones sociales.",
      observaciones: "Ansiedad social severa. Buen contacto visual en sesi\u00f3n individual.",
    },
    {
      paciente: "Luis Torres Medina",
      terapeuta: "Psic. Andrea Silva",
      fecha: "2026-06-16",
      descripcion: "Luis trajo la jerarqu\u00eda de situaciones sociales: desde saludar a un conocido hasta dar una opini\u00f3n en reuni\u00f3n. Se inici\u00f3 exposici\u00f3n gradual en imaginaci\u00f3n. Se identific\u00f3 distorsi\u00f3n de lectura de mente.",
      objetivo: "Exposici\u00f3n gradual y reestructuraci\u00f3n cognitiva",
      acuerdos: "Exposici\u00f3n en vivo: saludar a un compa\u00f1ero de trabajo cada d\u00eda.",
      observaciones: "Ansiedad alta antes de la exposici\u00f3n (8/10). Buenos resultados post-exposici\u00f3n.",
    },
  ];

  let count = 0;
  intervenciones.forEach((i) => {
    db.run(
      "INSERT INTO intervenciones (paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [i.paciente, i.terapeuta, i.fecha, i.descripcion, i.objetivo, i.acuerdos, i.observaciones],
      (err) => {
        if (!err) count++;
      }
    );
  });

  setTimeout(() => {
    console.log("Insertadas: " + count + "/" + intervenciones.length + " intervenciones");
    db.all("SELECT COUNT(*) as c FROM terapeutas", [], (_, r) => console.log("Terapeutas en DB:", r[0].c));
    db.all("SELECT COUNT(*) as c FROM intervenciones", [], (_, r) => console.log("Intervenciones en DB:", r[0].c));
    db.all("SELECT COUNT(*) as c FROM pacientes", [], (_, r) => console.log("Pacientes en DB:", r[0].c));
    db.close();
  }, 2000);
});
