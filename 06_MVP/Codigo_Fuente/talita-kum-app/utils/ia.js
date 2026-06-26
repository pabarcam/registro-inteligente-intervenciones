require("dotenv").config();

const http = require("http");
const https = require("https");

function sanitizeSummaryText(text) {
  if (typeof text !== "string") return "";

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseSummarySections(text) {
  if (typeof text !== "string" || !text.trim()) return [];

  const sections = [];
  const lines = text.split(/\r?\n/);
  let current = null;

  lines.forEach((line) => {
    const match = line.match(/^##\s*(\d+\.\s*[^\n]+)$/i);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), content: "" };
      return;
    }

    if (current) {
      current.content += (current.content ? "\n" : "") + line.trim();
    }
  });

  if (current) sections.push(current);
  return sections.filter((section) => section.content.trim());
}

function buildPatientSummary(paciente, registros = []) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return `No hay registros disponibles para ${paciente}; sin registros suficientes para generar una sintesis.`;
  }

  const total = registros.length;
  const ultimos = registros
    .slice(-2)
    .map((item) => item.descripcion || "Sin descripcion")
    .join(", ");

  return sanitizeSummaryText(
    `Resumen de ${paciente}: ${total} intervenciones registradas. Ultimos registros: ${ultimos}.`
  );
}

function buildClinicalPrompt(paciente, registros = []) {
  const registrosResumen = (registros || []).map((item) => ({
    fecha: item.fecha || "Sin fecha",
    terapeuta: item.terapeuta || "Sin terapeuta",
    descripcion: item.descripcion || "",
    objetivo: item.objetivo || "",
    acuerdos: item.acuerdos || "",
    observaciones: item.observaciones || "",
  }));

  return `Eres un asistente clínico especializado en terapia cognitivo-conductual (TCC).
Generas resúmenes estructurados del historial de un paciente para apoyar la continuidad del tratamiento.

Criterios TCC que debes considerar al analizar:
- Pensamientos automáticos, distorsiones cognitivas y reestructuración cognitiva.
- Conductas de evitación, activación conductual y tareas entre sesiones.
- Regulación emocional, ansiedad, estado de ánimo y habilidades de afrontamiento.
- Objetivos terapéuticos, acuerdos, adherencia al tratamiento y psicoeducación.
- Progreso medible entre sesiones (cambios conductuales, cognitivos o emocionales).

Reglas de redacción:
- Responde SOLO en español.
- Usa exactamente estas secciones y en este orden, cada una como título en una línea:
  ## 1. Intervenciones y fechas
  ## 2. Criticidad
  ## 3. Datos importantes de sesiones anteriores
  ## 4. Datos importantes de la ultima sesion
  ## 5. Avance entre sesiones
  ## 6. Enfoque TCC y temas de atención
- En "Criticidad" indica: Baja, Moderada, Alta o Critica, con una breve justificación clínica.
- Si hay una sola sesión, indicalo en las secciones correspondientes.
- Se conciso, clínico y basado únicamente en los registros proporcionados.
- No inventes datos que no aparezcan en los registros.
- No uses apartados de metas genéricas ni encabezados adicionales.

Paciente: ${paciente}
Registros:
${JSON.stringify(registrosResumen, null, 2)}`;
}

function parseAiResponse(payload) {
  if (!payload || typeof payload !== "object") return "";
  return (
    payload.response ||
    payload.summary ||
    payload.text ||
    payload.result ||
    payload.output_text ||
    payload.choices?.[0]?.message?.content ||
    payload.choices?.[0]?.text ||
    ""
  );
}

function buildAiPayload(prompt, model, endpoint) {
  const target = new URL(endpoint);
  if (target.pathname.includes("/api/generate")) {
    return {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
      },
    };
  }

  return {
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Eres un asistente clínico especializado en terapia cognitivo-conductual. Responde solo con el resumen estructurado solicitado y evita agregar metas genéricas.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };
}

async function buildPatientSummaryAsync(paciente, registros = []) {
  const apiUrl = process.env.AI_SUMMARY_API_URL;
  const apiKey = process.env.AI_SUMMARY_API_KEY;
  const model = process.env.AI_SUMMARY_MODEL || "llama3.2:3b";

  if (apiUrl) {
    try {
      const prompt = buildClinicalPrompt(paciente, registros);
      const payload = buildAiPayload(prompt, model, apiUrl);
      const headers = { "Content-Type": "application/json" };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const text = parseAiResponse(data);
        if (typeof text === "string" && text.trim()) {
          return sanitizeSummaryText(text);
        }
      }
    } catch (error) {
      console.error("No se pudo usar la API de resumen IA:", error.message);
    }
  }

  return buildPatientSummary(paciente, registros);
}

module.exports = {
  buildPatientSummary,
  buildPatientSummaryAsync,
  sanitizeSummaryText,
  buildClinicalPrompt,
  parseSummarySections,
};