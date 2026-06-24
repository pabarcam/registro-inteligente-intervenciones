function buildPatientSummary(paciente, registros = []) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return `No hay registros disponibles para ${paciente}; sin registros suficientes para generar una síntesis.`;
  }

  const total = registros.length;
  const ultimos = registros.slice(-2).map((item) => item.descripcion || 'Sin descripción').join(', ');
  const objetivos = registros
    .map((item) => item.objetivo)
    .filter(Boolean)
    .slice(0, 3)
    .join('; ');

  return `Resumen de ${paciente}: ${total} intervenciones registradas. Últimos registros: ${ultimos}. Objetivos principales: ${objetivos || 'No especificados'}.`;
}

async function buildPatientSummaryAsync(paciente, registros = []) {
  const apiUrl = process.env.AI_SUMMARY_API_URL;
  const apiKey = process.env.AI_SUMMARY_API_KEY;
  const model = process.env.AI_SUMMARY_MODEL || 'qwen-plus';

  if (apiUrl && apiKey) {
    try {
      const content = JSON.stringify(registros, null, 2);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente clínico que resume de forma breve y clara el historial de un paciente.',
            },
            {
              role: 'user',
              content: `Paciente: ${paciente}\nRegistros:\n${content}\nResume brevemente el historial clínico del paciente y destaca patrones relevantes.`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.summary || data.text || data.result || data.choices?.[0]?.message?.content || data.output_text;
        if (typeof text === 'string' && text.trim()) {
          return text.trim();
        }
      }
    } catch (error) {
      console.error('No se pudo usar la API de resumen IA:', error.message);
    }
  }

  return buildPatientSummary(paciente, registros);
}

module.exports = { buildPatientSummary, buildPatientSummaryAsync };
