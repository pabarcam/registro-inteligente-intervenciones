document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('[data-voice-target]');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = '⚠️ No disponible';
    });
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-voice-target');
      const textarea = document.getElementById(targetId);
      if (!textarea) return;

      button.textContent = '🎤 Escuchando...';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript.trim();
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        button.textContent = '⚠️ Error';
      };

      recognition.onstart = () => {
        button.textContent = '🎤 Escuchando...';
      };

      recognition.onend = () => {
        button.textContent = '🎤 Dictar';
      };

      try {
        recognition.stop();
        recognition.start();
      } catch (error) {
        console.error('No se pudo iniciar el reconocimiento de voz:', error);
        button.textContent = '⚠️ Error';
      }
    });
  });
});
