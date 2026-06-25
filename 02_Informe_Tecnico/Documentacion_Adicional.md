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
La solución también incorpora un módulo para generar resúmenes del historial del paciente.

### Implementación actual
- Se agrupan los registros por paciente.
- Se construye un resumen con los datos más recientes del historial disponible.
- El módulo se encuentra en utils/ia.js.

### Comportamiento
- Si no hay conexión a una API externa, el sistema usa un resumen local como respaldo.
- Si se configura una API externa, se puede mejorar la calidad del resumen.

### Valor institucional
Este módulo puede apoyar la revisión de casos, la toma de decisiones y la generación de una narrativa más clara sobre el historial del paciente.

---

## 3. Consideraciones de arquitectura
La arquitectura actual es simple y funcional para un MVP:
- capa de presentación con vistas EJS,
- capa de negocio con rutas y middleware,
- capa de datos con SQLite,
- módulo opcional de IA y voz.

Esta estructura permite avanzar de forma progresiva sin romper el funcionamiento base.
