# Talita Kum MVP

## Estado actual
Aplicación web funcional para el registro de intervenciones terapéuticas con login, dashboard, almacenamiento en SQLite y generación de resúmenes básicos.

## Funcionalidades implementadas
- Autenticación de usuarios
- Dashboard protegido
- Formulario para registrar intervenciones
- Almacenamiento en base de datos SQLite
- Dictado por voz básico para campos de texto
- Resumen de historial por paciente

## Estructura principal
- server.js: punto de entrada de la aplicación
- routes/: rutas de autenticación, dashboard, intervenciones y voz
- views/: vistas EJS para login, dashboard y formulario
- public/js/: scripts para interacción del navegador
- utils/ia.js: lógica de resumen de historial
- config/db.js: inicialización de la base de datos

## Ejecución
```bash
cd 06_MVP/Codigo_Fuente/talita-kum-app
npm start
```

## Variables de entorno opcionales
- AI_SUMMARY_API_URL
- AI_SUMMARY_API_KEY
- AI_SUMMARY_MODEL
- VOICE_TRANSCRIPTION_API_URL
- VOICE_TRANSCRIPTION_API_KEY

## Notas
El sistema funciona con un resumen local por defecto. La integración con IA externa es opcional y se activa cuando haya configuración disponible.
