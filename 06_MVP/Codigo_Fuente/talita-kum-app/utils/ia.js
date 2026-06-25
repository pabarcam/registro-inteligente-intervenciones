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
    .replace(/\s{2,}/g, " ")
    .trim();
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

async function buildPatientSummaryAsync(paciente, registros = []) {
  const apiUrl = process.env.AI_SUMMARY_API_URL;
  const apiKey = process.env.AI_SUMMARY_API_KEY;
  const model = process.env.AI_SUMMARY_MODEL || "qwen-plus";

  if (apiUrl && apiKey) {
    try {
      const registrosResumen = registros.map((item) => ({
        fecha: item.fecha,
        terapeuta: item.terapeuta,
        descripcion: item.descripcion,
        observaciones: item.observaciones,
      }));
      const content = JSON.stringify(registrosResumen, null, 2);
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
            {
              role: "system",
              content:
                "Eres un asistente clinico que resume de forma breve y clara el historial de un paciente. No incluyas apartados de metas ni encabezados similares.",
            },
            {
              role: "user",
              content: `Paciente: ${paciente}\nRegistros:\n${content}\nResume brevemente el historial clinico del paciente y destaca patrones relevantes. Evita apartados de metas o encabezados similares.`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text =
          data.summary ||
          data.text ||
          data.result ||
          data.choices?.[0]?.message?.content ||
          data.output_text;
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

module.exports = { buildPatientSummary, buildPatientSummaryAsync, sanitizeSummaryText };
