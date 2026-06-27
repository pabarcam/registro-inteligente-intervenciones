# Documentación adicional del proyecto

## 1. Módulo de dictado por voz
El sistema incorpora un módulo de dictado por voz para facilitar la captura de información en los campos de texto del formulario de intervención.

### Funcionalidad
- El usuario presiona el botón de dictado.
- El navegador activa el reconocimiento de voz.
- El texto hablado se inserta en el campo correspondiente.
- El flujo está pensado para los campos de descripción, objetivo, acuerdos y observaciones.

### Implementación actual
- Se utiliza la API de reconocimiento de voz del navegador.
- Es una solución simple, funcional y adecuada para un MVP.
- La lógica se encuentra en el archivo public/js/voice-api.js.

### Limitaciones
- Depende del soporte del navegador.
- Requiere permiso del micrófono.
- El resultado puede variar según el entorno y la calidad del audio.

### Evolución recomendada
En una siguiente etapa se puede reemplazar por una solución basada en una API externa de transcripción para mejorar precisión y escalabilidad.

---

## 2. Módulo de resúmenes con IA
La solución incorpora un agente de resumen clínico estructurado para el historial del paciente.

### Formato del resumen (6 secciones)
1. Intervenciones y fechas
2. Criticidad (Baja / Moderada / Alta / Crítica)
3. Datos importantes de sesiones anteriores
4. Datos importantes de la última sesión
5. Avance entre sesiones
6. Enfoque TCC y temas de atención (terapia cognitivo-conductual)

### Implementación actual
- Módulo principal en `utils/ia.js` con agente LLM y fallback local estructurado.
- Cache de resúmenes en tabla SQLite `resumenes` (`utils/summaryCache.js`).
- Integración al guardar intervenciones (correo SMTP) y en dashboard del paciente.
- Documentación técnica: `docs/integracion-ia.md` y `.env.example`.

### Comportamiento
- Si hay API externa configurada (`AI_SUMMARY_API_URL`, `AI_SUMMARY_API_KEY`), se usa el agente LLM con criterios TCC.
- Si no hay conexión o falla la API, el sistema genera el mismo formato con heurística local.

### Valor institucional
Este módulo apoya la revisión de casos, la continuidad del tratamiento y la narrativa clínica bajo enfoque cognitivo-conductual.

---

## 3. Consideraciones de arquitectura
La arquitectura actual es simple y funcional para un MVP:
- capa de presentación con vistas EJS,
- capa de negocio con rutas y middleware,
- capa de datos con SQLite,
- módulo opcional de IA y voz.

Esta estructura permite avanzar de forma progresiva sin romper el funcionamiento base.
