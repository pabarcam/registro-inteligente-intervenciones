const nodemailer = require("nodemailer");

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Crea el transporter de Nodemailer.
 * Si no hay credenciales SMTP configuradas devuelve null y el envío se omite.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[mailer] Variables SMTP no configuradas — el correo no se enviará.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "465", 10),
    secure: SMTP_SECURE !== "false",   // true para 465, false para 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Envía el correo de confirmación al terapeuta.
 *
 * @param {object} opts
 * @param {string} opts.destinatario  - Correo del terapeuta
 * @param {string} opts.terapeuta     - Nombre del terapeuta
 * @param {string} opts.paciente      - Nombre del paciente
 * @param {string} opts.fecha         - Fecha de la sesión
 * @param {string} opts.descripcion   - Texto de la entrevista
 * @param {string} opts.resumenIA     - Resumen generado por la IA
 * @param {string|null} opts.audioPath- Ruta absoluta del archivo de audio (puede ser null)
 */
async function enviarCorreoIntervencion(opts) {
  const { destinatario, terapeuta, paciente, fecha, descripcion, resumenIA, audioPath } = opts;

  const transporter = createTransporter();
  if (!transporter) return { ok: false, razon: "SMTP no configurado" };

  const attachments = [];
  if (audioPath) {
    attachments.push({
      filename: `sesion-${paciente}-${fecha}.webm`,
      path: audioPath,
      contentType: "audio/webm",
    });
  }

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <div style="background:#111;padding:24px 32px;border-radius:16px 16px 0 0;">
        <h1 style="color:#ff6f00;margin:0;font-size:1.3rem;">🌿 Talita-Kum</h1>
        <p style="color:#fff;margin:4px 0 0;font-size:0.9rem;">Registro de Intervención Terapéutica</p>
      </div>

      <div style="border:2px solid #111;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">
        <p style="font-size:1rem;">Hola, <strong>${terapeuta}</strong> 👋</p>
        <p style="color:#555;font-size:0.9rem;">
          Se ha guardado exitosamente una nueva intervención para el paciente
          <strong>${paciente}</strong> el día <strong>${fecha}</strong>.
        </p>

        <hr style="border:1.5px solid #f0e8df;margin:20px 0;">

        <h3 style="color:#ff6f00;margin-bottom:10px;">✦ Resumen generado por IA</h3>
        <div style="background:#fff8f2;border-left:4px solid #ff6f00;padding:16px;border-radius:8px;
                    font-size:0.9rem;line-height:1.7;color:#333;white-space:pre-wrap;">
          ${escapeHtml(resumenIA) || "No se pudo generar el resumen en este momento."}
        </div>

        <hr style="border:1.5px solid #f0e8df;margin:20px 0;">

        <h3 style="margin-bottom:10px;">📝 Texto de la entrevista</h3>
        <div style="background:#f9f6f2;border:1.5px solid #e0d8cf;padding:16px;border-radius:8px;
                    font-size:0.88rem;line-height:1.7;color:#444;white-space:pre-wrap;">
${descripcion || "Sin descripción registrada."}
        </div>

        ${audioPath ? `<p style="margin-top:16px;font-size:0.85rem;color:#777;">
          🎙️ El archivo de audio de la sesión se adjunta a este correo.
        </p>` : ""}

        <p style="margin-top:28px;font-size:0.8rem;color:#aaa;text-align:center;">
          Talita-Kum · Sistema de Registro Inteligente de Intervenciones · ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Talita-Kum" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `✅ Intervención guardada — ${paciente} (${fecha})`,
      html,
      attachments,
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] Error al enviar correo:", err.message);
    return { ok: false, razon: err.message };
  }
}

module.exports = { enviarCorreoIntervencion };
