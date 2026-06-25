document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('[data-voice-target]');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = '⚠️ No disponible';
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let currentTextarea = null;
  let currentButton = null;
  let listening = false;

  const resetButton = () => {
    if (currentButton) {
      currentButton.textContent = '🎤 Dictar';
      currentButton.classList.remove('btn-danger');
      currentButton.classList.add('btn-outline-secondary');
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-voice-target');
      const textarea = document.getElementById(targetId);
      if (!textarea) return;

      if (listening) {
        recognition.stop();
        listening = false;
        resetButton();
        return;
      }

      currentTextarea = textarea;
      currentButton = button;
      listening = true;

      button.textContent = '🛑 Hablar ahora';
      button.classList.remove('btn-outline-secondary');
      button.classList.add('btn-danger');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (currentTextarea) {
          currentTextarea.value = (currentTextarea.value ? currentTextarea.value + ' ' : '') + transcript.trim();
        }
      };

      recognition.onerror = (event) => {
        console.error('Error de voz:', event.error);
        listening = false;
        resetButton();
      };

      recognition.onend = () => {
        listening = false;
        resetButton();
      };

      try {
        recognition.stop();
        recognition.start();
      } catch (error) {
        console.error('No se pudo iniciar el reconocimiento:', error);
        listening = false;
        resetButton();
      }
    });
  });
});
