# Talita Kum MVP

## Estado actual
Aplicación web funcional orientada al registro inteligente de intervenciones terapéuticas. Incluye autenticación, dashboard clínico, dictado por voz, almacenamiento en SQLite, notificaciones por correo electrónico y resúmenes de pacientes.

## Funcionalidades implementadas
- **Autenticación y Roles**: Login para terapeutas y panel de administración para gestionar aprobaciones.
- **Dashboard Clínico**: Interfaz moderna para visualizar pacientes agrupados, sesiones y resúmenes clínicos de las intervenciones.
- **Historial Profesional**: Listado de intervenciones registradas por el terapeuta, con capacidad de **edición** y **eliminación** de registros.
- **Registro de Pacientes**: Autocompletado inteligente desde base de datos, validación estricta para crear nuevos pacientes (requiere Nombre y Apellidos).
- **Dictado de voz Inteligente**: Uso de la Web Speech API para transcribir el dictado de forma simultánea en el `textarea` y soporte para grabar el audio localmente para respaldo.
- **Resumen IA y Notificaciones**: Generación de resúmenes consolidados del historial del paciente al registrar una intervención, y envío automático de un reporte por correo electrónico (SMTP) al profesional con el resumen y el archivo de audio adjunto.

## Estructura principal
- `server.js`: Punto de entrada de la aplicación.
- `routes/`: Enrutadores para autenticación, dashboard, intervenciones, profesionales.
- `views/`: Vistas EJS responsivas e interactivas (login, dashboard, paciente, nueva intervención, historial, admin).
- `public/`: Archivos estáticos como el logo de la Fundación Talita Kum.
- `utils/ia.js`: Lógica de resumen de historial clínico de pacientes.
- `utils/mailer.js`: Lógica de envío de correos electrónicos.
- `config/db.js`: Configuración y esquemas de la base de datos SQLite.

## Ejecución
```bash
npm install
npm start
```

## Variables de entorno necesarias (`.env`)
- `SESSION_SECRET`
- `PORT`
- **Correo (SMTP)**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- **IA Externa (Opcional)**: `AI_SUMMARY_API_URL`, `AI_SUMMARY_API_KEY`, `AI_SUMMARY_MODEL`
