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
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-voice-target');
      const textarea = document.getElementById(targetId);
      if (!textarea) return;

      button.textContent = '🎤 Escuchando...';
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript;
        button.textContent = '🎤 Dictar';
      };

      recognition.onerror = () => {
        button.textContent = '🎤 Dictar';
      };

      recognition.onend = () => {
        button.textContent = '🎤 Dictar';
      };
    });
  });
});
