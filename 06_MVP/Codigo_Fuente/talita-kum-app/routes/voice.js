const express = require('express');
const router = express.Router();

router.post('/transcribir', async (req, res) => {
  try {
    const audioBase64 = req.body.audioBase64;
    const apiUrl = process.env.VOICE_TRANSCRIPTION_API_URL;
    const apiKey = process.env.VOICE_TRANSCRIPTION_API_KEY;

    if (!audioBase64 || !apiUrl || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'No hay configuración para transcripción por voz.',
      });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio: audioBase64,
        language: 'es',
        model: 'whisper',
      }),
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: 'La API de transcripción no respondió correctamente.',
      });
    }

    const data = await response.json();
    const text = data.text || data.transcript || data.result || '';

    return res.json({ success: true, text });
  } catch (error) {
    console.error('Error en transcripción por voz:', error);
    return res.status(500).json({ success: false, message: 'No se pudo transcribir el audio.' });
  }
});

module.exports = router;
