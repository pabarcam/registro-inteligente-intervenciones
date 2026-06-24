const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPatientSummary, buildPatientSummaryAsync } = require('../utils/ia');

test('buildPatientSummary devuelve un resumen claro con los datos básicos', () => {
  const registros = [
    {
      paciente: 'Ana',
      fecha: '2026-06-01',
      descripcion: 'Sesión de terapia cognitiva',
      objetivo: 'Mejorar la atención',
      acuerdos: 'Práctica diaria',
      observaciones: 'Paciente participó activamente'
    },
    {
      paciente: 'Ana',
      fecha: '2026-06-10',
      descripcion: 'Seguimiento de emociones',
      objetivo: 'Gestionar ansiedad',
      acuerdos: 'Respiración guiada',
      observaciones: 'Se observó progreso'
    }
  ];

  const resumen = buildPatientSummary('Ana', registros);

  assert.match(resumen, /Ana/);
  assert.match(resumen, /2 intervenciones/);
  assert.match(resumen, /terapia cognitiva|emociones/);
});

test('buildPatientSummary maneja registros vacíos con un mensaje simple', () => {
  const resumen = buildPatientSummary('Sin datos', []);
  assert.match(resumen, /sin registros/i);
});

test('buildPatientSummaryAsync usa el fallback local cuando no hay API configurada', async () => {
  delete process.env.AI_SUMMARY_API_URL;
  delete process.env.AI_SUMMARY_API_KEY;

  const resumen = await buildPatientSummaryAsync('Ana', [{ descripcion: 'Sesión de seguimiento' }]);

  assert.match(resumen, /Ana/);
  assert.match(resumen, /1 intervenciones/);
});
