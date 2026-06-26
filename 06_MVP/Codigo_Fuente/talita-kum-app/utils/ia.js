const SUMMARY_SECTIONS = [
  "Intervenciones y fechas",
  "Criticidad",
  "Datos importantes de sesiones anteriores",
  "Datos importantes de la ultima sesion",
  "Avance entre sesiones",
  "Enfoque TCC y temas de atencion",
];

const CBT_SYSTEM_PROMPT = `Eres un asistente clinico especializado en terapia cognitivo-conductual (TCC).
Generas resumenes estructurados del historial de un paciente para apoyar la continuidad del tratamiento.

Criterios TCC que debes considerar al analizar:
- Pensamientos automaticos, distorsiones cognitivas y reestructuracion cognitiva.
- Conductas de evitacion, activacion conductual y tareas entre sesiones.
- Regulacion emocional, ansiedad, estado de animo y habilidades de afrontamiento.
- Objetivos terapeuticos, acuerdos, adherencia al tratamiento y psicoeducacion.
- Progreso medible entre sesiones (cambios conductuales, cognitivos o emocionales).

Reglas de redaccion:
- Responde SOLO en espanol.
- Usa exactamente estas secciones y en este orden, cada una como titulo en una linea:
  ## 1. Intervenciones y fechas
  ## 2. Criticidad
  ## 3. Datos importantes de sesiones anteriores
  ## 4. Datos importantes de la ultima sesion
  ## 5. Avance entre sesiones
  ## 6. Enfoque TCC y temas de atencion
- En "Criticidad" indica: Baja, Moderada, Alta o Critica, con una breve justificacion clinica.
- Si hay una sola sesion, indicalo en las secciones correspondientes.
- Se conciso, clinico y basado unicamente en los registros proporcionados.
- No inventes datos que no aparezcan en los registros.
- No uses apartados de metas genericas ni encabezados adicionales.`;

function sanitizeSummaryText(text) {
  if (typeof text !== "string") return "";

  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/objetivos?\s+principales?\s*:?\s*/gi, "")
        .replace(/\bprincipales?\s+objetivos?\s*:?\s*/gi, "")
        .trim()
    )
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeRegistros(registros = []) {
  if (!Array.isArray(registros)) return [];

  return [...registros]
    .filter((item) => item && typeof item === "object")
    .sort((a, b) => {
      const dateA = a.fecha || "";
      const dateB = b.fecha || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.id || 0) - (b.id || 0);
    });
}

function mapRegistroForSummary(item) {
  return {
    fecha: item.fecha || "Sin fecha",
    terapeuta: item.terapeuta || "Sin terapeuta",
    descripcion: item.descripcion || "",
    objetivo: item.objetivo || "",
    acuerdos: item.acuerdos || "",
    observaciones: item.observaciones || "",
  };
}

function inferCriticidad(registros) {
  const text = registros
    .map((r) => [r.descripcion, r.observaciones, r.objetivo].join(" "))
    .join(" ")
    .toLowerCase();

  const highSignals = /(crisis|urgente|riesgo|autoles|suicid|violencia|hospitaliz|grave|sever)/;
  const moderateSignals = /(ansiedad|depres|evitacion|recaida|dificult|empeor|angustia|estres)/;

  if (highSignals.test(text)) {
    return "Alta — Se detectan indicadores que requieren seguimiento prioritario segun los registros.";
  }
  if (moderateSignals.test(text)) {
    return "Moderada — Hay sintomas o dificultades relevantes que conviene monitorear en las proximas sesiones.";
  }
  return "Baja — No se observan senales de urgencia en los registros disponibles.";
}

function excerpt(text, max = 180) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "Sin informacion registrada.";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function buildIntervencionesList(registros) {
  return registros
    .map((item, index) => {
      const resumen = excerpt(item.descripcion || item.objetivo, 80);
      return `- Sesion ${index + 1} (${item.fecha}): ${resumen}`;
    })
    .join("\n");
}

function buildLocalSectionContent(section, paciente, registros) {
  const ultima = registros[registros.length - 1];
  const anteriores = registros.slice(0, -1);

  switch (section) {
    case "Intervenciones y fechas":
      return `${registros.length} intervencion(es) registrada(s) para ${paciente}:\n${buildIntervencionesList(registros)}`;

    case "Criticidad":
      return inferCriticidad(registros);

    case "Datos importantes de sesiones anteriores":
      if (anteriores.length === 0) {
        return "No hay sesiones anteriores; esta es la primera intervencion registrada.";
      }
      return anteriores
        .map((item, index) => {
          const partes = [
            item.descripcion && `Descripcion: ${excerpt(item.descripcion)}`,
            item.objetivo && `Objetivo: ${excerpt(item.objetivo)}`,
            item.acuerdos && `Acuerdos: ${excerpt(item.acuerdos)}`,
            item.observaciones && `Observaciones: ${excerpt(item.observaciones)}`,
          ].filter(Boolean);
          return `Sesion ${index + 1} (${item.fecha}): ${partes.join(" | ") || "Sin detalle"}`;
        })
        .join("\n");

    case "Datos importantes de la ultima sesion":
      return [
        `Fecha: ${ultima.fecha || "Sin fecha"}`,
        `Descripcion: ${excerpt(ultima.descripcion)}`,
        ultima.objetivo ? `Objetivo TCC: ${excerpt(ultima.objetivo)}` : null,
        ultima.acuerdos ? `Acuerdos/tareas: ${excerpt(ultima.acuerdos)}` : null,
        ultima.observaciones ? `Observaciones: ${excerpt(ultima.observaciones)}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    case "Avance entre sesiones":
      if (registros.length < 2) {
        return "Aun no hay suficientes sesiones para comparar avance; se requiere al menos una sesion adicional.";
      }
      return `Comparando la sesion del ${anteriores[anteriores.length - 1].fecha} con la del ${ultima.fecha}: ` +
        `ultima descripcion — ${excerpt(ultima.descripcion)}. ` +
        `Observaciones recientes — ${excerpt(ultima.observaciones, 120)}`;

    case "Enfoque TCC y temas de atencion":
      return (
        "Temas detectados en los registros (lectura TCC): " +
        [
          ultima.objetivo && `objetivo terapeutico (${excerpt(ultima.objetivo, 90)})`,
          ultima.acuerdos && `tareas/acuerdos conductuales (${excerpt(ultima.acuerdos, 90)})`,
          excerpt(ultima.descripcion, 90) !== "Sin informacion registrada." &&
            `contenido de sesion (${excerpt(ultima.descripcion, 90)})`,
        ]
          .filter(Boolean)
          .join("; ") +
        ". Sugerencia: reforzar registro de pensamientos automaticos, conductas de evitacion y tareas entre sesiones."
      );

    default:
      return "Sin informacion.";
  }
}

function buildStructuredSummary(paciente, registros = [], source = "local") {
  if (!Array.isArray(registros) || registros.length === 0) {
    return `No hay registros disponibles para ${paciente}; sin registros suficientes para generar una sintesis estructurada.`;
  }

  const ordered = normalizeRegistros(registros).map(mapRegistroForSummary);
  const sections = SUMMARY_SECTIONS.map((section, index) => {
    const content = buildLocalSectionContent(section, paciente, ordered);
    return `## ${index + 1}. ${section}\n${content}`;
  });

  const header =
    source === "ia"
      ? `Resumen clinico estructurado (IA) — ${paciente}`
      : `Resumen clinico estructurado — ${paciente}`;

  return sanitizeSummaryText(`${header}\n\n${sections.join("\n\n")}`);
}

function buildPatientSummary(paciente, registros = []) {
  return buildStructuredSummary(paciente, registros, "local");
}

function buildUserPrompt(paciente, registros) {
  const ordered = normalizeRegistros(registros).map(mapRegistroForSummary);
  const ultima = ordered[ordered.length - 1];
  const anteriores = ordered.slice(0, -1);

  return `Paciente: ${paciente}
Total de intervenciones: ${ordered.length}
Ultima sesion (fecha ${ultima.fecha}):
${JSON.stringify(ultima, null, 2)}
Sesiones anteriores:
${anteriores.length ? JSON.stringify(anteriores, null, 2) : "[]"}

Genera el resumen clinico estructurado con las 6 secciones indicadas, aplicando criterios de terapia cognitivo-conductual.`;
}

function extractSummaryFromResponse(data) {
  if (!data || typeof data !== "object") return null;

  const text =
    data.summary ||
    data.text ||
    data.result ||
    data.choices?.[0]?.message?.content ||
    data.output_text;

  return typeof text === "string" && text.trim() ? text : null;
}

async function callSummaryAgent(paciente, registros) {
  const apiUrl = process.env.AI_SUMMARY_API_URL;
  const apiKey = process.env.AI_SUMMARY_API_KEY;
  const model = process.env.AI_SUMMARY_MODEL || "qwen-plus";

  if (!apiUrl || !apiKey) {
    return null;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: CBT_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(paciente, registros) },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`API resumen respondio ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = extractSummaryFromResponse(data);
  if (!text) {
    throw new Error("La API no devolvio un resumen de texto valido");
  }

  return sanitizeSummaryText(text);
}

async function buildPatientSummaryAsync(paciente, registros = []) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return buildPatientSummary(paciente, registros);
  }

  try {
    const iaSummary = await callSummaryAgent(paciente, registros);
    if (iaSummary) {
      return iaSummary;
    }
  } catch (error) {
    console.error("No se pudo usar la API de resumen IA:", error.message);
  }

  return buildStructuredSummary(paciente, registros, "local");
}

function parseSummarySections(summary) {
  if (!summary || typeof summary !== "string") return [];
  const parts = summary.split(/^##\s*\d+\.\s+/m);
  if (parts.length < 2) return [];
  const sections = [];
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].trim();
    const lineBreak = block.indexOf("\n");
    const title = lineBreak > 0 ? block.slice(0, lineBreak).trim() : "Sección";
    const content = lineBreak > 0 ? block.slice(lineBreak).trim() : "";
    sections.push({ title, content });
  }
  return sections;
}

module.exports = {
  SUMMARY_SECTIONS,
  CBT_SYSTEM_PROMPT,
  buildPatientSummary,
  buildPatientSummaryAsync,
  buildStructuredSummary,
  callSummaryAgent,
  sanitizeSummaryText,
  normalizeRegistros,
  parseSummarySections,
};
