const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildPatientSummary,
  buildPatientSummaryAsync,
  SUMMARY_SECTIONS,
} = require("../utils/ia");

const registrosEjemplo = [
  {
    paciente: "Ana",
    fecha: "2026-06-01",
    descripcion: "Sesion de terapia cognitiva",
    objetivo: "Mejorar la atencion",
    acuerdos: "Practica diaria",
    observaciones: "Paciente participo activamente",
  },
  {
    paciente: "Ana",
    fecha: "2026-06-10",
    descripcion: "Seguimiento de emociones",
    objetivo: "Gestionar ansiedad",
    acuerdos: "Respiracion guiada",
    observaciones: "Se observo progreso",
  },
];

test("buildPatientSummary incluye las 6 secciones estructuradas", () => {
  const resumen = buildPatientSummary("Ana", registrosEjemplo);

  assert.match(resumen, /Ana/);
  SUMMARY_SECTIONS.forEach((section, index) => {
    assert.match(resumen, new RegExp(`## ${index + 1}\\. ${section}`, "i"));
  });
  assert.match(resumen, /terapia cognitiva|emociones/i);
});

test("buildPatientSummary maneja registros vacios", () => {
  const resumen = buildPatientSummary("Sin datos", []);
  assert.match(resumen, /sin registros/i);
});

test("buildPatientSummary evalua criticidad en fallback local", () => {
  const resumen = buildPatientSummary("Ana", registrosEjemplo);
  assert.match(resumen, /## 2\. Criticidad/i);
  assert.match(resumen, /Baja|Moderada|Alta|Critica/i);
});

test("buildPatientSummaryAsync usa el fallback local cuando no hay API configurada", async () => {
  delete process.env.AI_SUMMARY_API_URL;
  delete process.env.AI_SUMMARY_API_KEY;

  const resumen = await buildPatientSummaryAsync("Ana", [
    { fecha: "2026-06-01", descripcion: "Sesion de seguimiento" },
  ]);

  assert.match(resumen, /Ana/);
  assert.match(resumen, /## 1\. Intervenciones y fechas/i);
});
