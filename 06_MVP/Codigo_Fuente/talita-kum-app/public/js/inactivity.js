(function () {
  var TIMEOUT_MS = 3 * 60 * 1000;
  var WARNING_MS = 30 * 1000;
  var timeoutId = null;
  var warningId = null;

  var overlay = document.createElement("div");
  overlay.id = "inactivity-overlay";
  overlay.innerHTML =
    '<div class="inactivity-dialog" role="dialog" aria-modal="true">' +
    '<div class="inactivity-icon">⏳</div>' +
    '<h3>¿Deseas continuar con la sesión?</h3>' +
    '<p>Has estado inactivo por 3 minutos. Si no respondes, la sesión se cerrará automáticamente.</p>' +
    '<div class="inactivity-actions">' +
    '<button id="inactivity-yes" class="btn-inactivity btn-inactivity-primary">Sí, continuar</button>' +
    '<button id="inactivity-no" class="btn-inactivity btn-inactivity-secondary">Cerrar sesión</button>' +
    "</div>" +
    "</div>";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;" +
    "background:rgba(17,17,17,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);" +
    "animation:fadeIn 0.3s ease;";

  var style = document.createElement("style");
  style.textContent =
    "@keyframes fadeIn{from{opacity:0}to{opacity:1}}" +
    "@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}" +
    ".inactivity-dialog{background:#fff;border-radius:20px;padding:36px 40px;max-width:420px;width:90vw;" +
    "text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.2);animation:slideUp 0.35s ease;}" +
    ".inactivity-icon{font-size:3rem;margin-bottom:12px;}" +
    ".inactivity-dialog h3{font-family:'Merriweather',serif;font-size:1.15rem;font-weight:700;margin-bottom:8px;color:#111;}" +
    ".inactivity-dialog p{font-size:0.9rem;color:#6b6b6b;margin-bottom:24px;line-height:1.6;}" +
    ".inactivity-actions{display:flex;gap:10px;justify-content:center;}" +
    ".btn-inactivity{padding:11px 24px;border-radius:999px;font-weight:700;font-size:0.9rem;border:2px solid transparent;cursor:pointer;transition:background 0.18s,color 0.18s;}" +
    ".btn-inactivity-primary{background:#ff6f00;color:#fff;border-color:#ff6f00;}" +
    ".btn-inactivity-primary:hover{background:#e65f00;border-color:#e65f00;}" +
    ".btn-inactivity-secondary{background:#fff;color:#111;border-color:#111;}" +
    ".btn-inactivity-secondary:hover{background:#111;color:#fff;}";

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  function resetTimer() {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningId) clearTimeout(warningId);
    overlay.style.display = "none";
    timeoutId = setTimeout(showWarning, TIMEOUT_MS);
  }

  function showWarning() {
    overlay.style.display = "flex";
    warningId = setTimeout(forceLogout, WARNING_MS);
  }

  function forceLogout() {
    overlay.style.display = "none";
    window.location.href = "/logout";
  }

  function dismissWarning() {
    if (warningId) clearTimeout(warningId);
    overlay.style.display = "none";
    resetTimer();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(function (ev) {
      document.addEventListener(ev, resetTimer, { passive: true });
    });
    resetTimer();
  });

  document.addEventListener("click", function (e) {
    if (e.target.id === "inactivity-yes") {
      dismissWarning();
    }
    if (e.target.id === "inactivity-no") {
      window.location.href = "/logout";
    }
  });
})();
