# Arquitectura de la solución

## 1. Visión general
La solución sigue una arquitectura web simple y modular, compuesta por:
- una interfaz web para usuarios,
- un servidor backend en Node.js,
- una capa de rutas y middleware,
- una base de datos local para el MVP,
- un módulo opcional de IA para síntesis de historial.

## 2. Componentes principales
### Frontend
- Vistas renderizadas con EJS.
- Formularios para login, dashboard y registro de intervenciones.
- Interacción con reconocimiento de voz del navegador.

### Backend
- Servidor Express.
- Rutas para autenticación, dashboard e intervenciones.
- Middleware de autenticación para proteger pantallas.

### Datos
- Base de datos SQLite para el MVP.
- Tablas para usuarios, pacientes e intervenciones.

### Integración con IA
- Módulo opcional para generar resúmenes a partir del historial del paciente.
- Soporta fallback local si no hay API externa configurada.
- Está preparado para integrarse con servicios como Qwen.

## 3. Flujo arquitectónico
1. El usuario inicia sesión.
2. El sistema verifica credenciales y crea una sesión.
3. El usuario registra una intervención.
4. La información se guarda en la base de datos.
5. El dashboard consulta los registros y genera síntesis.

## 4. Consideraciones de despliegue
En una primera etapa la solución puede ejecutarse en:
- un equipo local,
- un servidor de pruebas,
- un hosting con Node.js y acceso a archivos.

Para escalabilidad futura se puede migrar a:
- PostgreSQL o MySQL,
- contenedores,
- despliegue en nube con monitoreo y respaldos.

## 5. Decisiones de arquitectura
- Uso de Node.js para velocidad y simplicidad.
- SQLite para reducir costos y acelerar el desarrollo del MVP.
- Separación de rutas y lógica de negocio para facilitar mantenimiento.
- Diseño preparado para incorporar IA sin romper la arquitectura base.
