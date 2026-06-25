# Informe Técnico

## Registro Inteligente de Intervenciones para Fundación Cristo Vive

### Portada

Proyecto: Registro Inteligente de Intervenciones

Equipo: Equipo de desarrollo del MVP
Carrera / Área: Ingeniería de Sistemas / Desarrollo de Software
Representante: Paulo Abarca Matamala - Ingeniero Informático (Líder de grupo)

---

## 1. Resumen de la solución

Fundación Cristo Vive requiere un mecanismo más ordenado, seguro y trazable para registrar las intervenciones terapéuticas que realizan con sus pacientes. El proyecto desarrolla una solución web que permite capturar intervenciones en un sistema digital, almacenarlas de forma estructurada, consultarlas en un dashboard y generar resúmenes útiles del historial del paciente.

La propuesta incorpora además funciones de dictado por voz y una base preparada para integrar inteligencia artificial en una siguiente etapa, con el objetivo de facilitar la captura y análisis de información sin perder la trazabilidad y la calidad del registro.

---

## 2. Comprensión del contexto

### Problema identificado

En los procesos tradicionales, la información relacionada con intervenciones puede quedar dispersa, incompleta o difícil de consultar. Esto complica:

- la trazabilidad de las intervenciones,
- el seguimiento del historial del paciente,
- la generación de reportes y análisis,
- y la toma de decisiones institucionales.

### Usuario principal

- Terapeutas o personal encargado de registrar intervenciones.
- Administradores del sistema.
- Directivos o líderes institucionales que necesitan seguimiento y reportes.

### Necesidad

Contar con una herramienta sencilla, funcional y accesible que permita registrar intervenciones de forma organizada, rápida y segura.

### Restricciones

- El proyecto inicia como un MVP funcional.
- Se busca una solución de bajo costo y fácil implementación.
- Debe ser adaptable a un entorno real institucional sin requerir una infraestructura compleja.

---

## 3. Diseño de la solución

### Funcionalidades principales

- Inicio de sesión con autenticación básica.
- Dashboard protegido para visualizar intervenciones registradas.
- Formulario para registrar nuevas intervenciones.
- Almacenamiento de datos en una base local.
- Dictado por voz para facilitar la captura de texto.
- Generación de resúmenes de historial por paciente.

### Flujo de uso

1. El usuario ingresa al sistema.
2. Se autentica mediante correo y contraseña.
3. Accede al dashboard.
4. Registra una nueva intervención.
5. El sistema valida y almacena la información.
6. El registro queda disponible para consulta y análisis.

### Representación visual del sistema

El sistema se organiza en tres capas principales:

- Interfaz web para usuarios.
- Backend para lógica de negocio y validación.
- Base de datos para almacenamiento.

---

## 4. Prototipo o demo

El MVP ya cuenta con una demostración funcional del flujo completo, que puede evidenciarse mediante:

- pantalla de login,
- dashboard con registros,
- formulario de nueva intervención,
- captura y almacenamiento de información,
- visualización de resúmenes por paciente.

Se recomienda incluir capturas en la carpeta de evidencia o en la presentación institucional.

Archivos de apoyo disponibles:

- [06_MVP/Capturas/README.md](../06_MVP/Capturas/README.md)
- [04_Diagramas/README.md](../04_Diagramas/README.md)

---

## 5. Arquitectura y tecnologías

### Tecnologías utilizadas

- Node.js como entorno de ejecución del backend.
- Express para la creación del servidor web y rutas.
- EJS como motor de plantillas para las vistas.
- SQLite como base de datos local del MVP.
- JavaScript para la lógica del lado del cliente.
- Reconocimiento de voz del navegador para dictado básico.

### Estructura técnica

- server.js: punto de entrada de la aplicación.
- routes/: módulos para autenticación, dashboard, intervenciones y voz.
- views/: interfaz de usuario.
- public/js/: scripts del navegador.
- utils/ia.js: módulo de resumen de historial.
- config/db.js: configuración y creación de tablas.

### Justificación técnica

La arquitectura elegida permite desarrollar una solución funcional, económica y rápida para una primera etapa, con posibilidad de escalar en futuras fases.

---

## 6. Seguridad y protección de datos

### Medidas implementadas

- Autenticación básica de usuarios.
- Acceso protegido a pantallas mediante sesiones.
- Validación de campos obligatorios en formularios.
- Almacenamiento estructurado de información.

### Medidas recomendadas para producción

- Uso de HTTPS.
- Contraseñas seguras y gestión de sesiones robusta.
- Copias de seguridad periódicas.
- Registro de auditoría de cambios.
- Separación de entornos de desarrollo, pruebas y producción.
- Migración a una base de datos más robusta si crece la carga institucional.

### Riesgos mitigados

- pérdida parcial de información,
- accesos no autorizados,
- registros incompletos,
- falta de trazabilidad.

---

## 7. Uso de datos e indicadores

La solución puede generar valor institucional a través de indicadores como:

- número de intervenciones registradas por mes,
- cantidad de intervenciones por terapeuta,
- cantidad de registros completos,
- seguimiento por paciente,
- patrones de atención o evolución del historial.

Asimismo, el módulo de resúmenes permite apoyar la revisión de casos y la toma de decisiones con información más organizada.

---

## 8. Viabilidad

### Factibilidad técnica

La solución es viable porque ya cuenta con un MVP funcional, con flujo completo de login, registro, almacenamiento y visualización.

### Factibilidad operativa

Es adecuada para una implementación inicial en Fundación Cristo Vive con recursos modestos y un equipo técnico pequeño.

### Limitaciones actuales

- La base de datos actual es local y simple.
- El dictado por voz es básico y depende del navegador y del permiso del micrófono.
- La IA externa está preparada, pero no es obligatoria para el funcionamiento inicial.

### Próximos pasos

- integrar una API de transcripción más robusta,
- conectar una API de IA para resúmenes más elaborados,
- mejorar la seguridad y auditoría,
- migrar a una base de datos más escalable.

---

## 9. Conclusiones

El proyecto aporta una solución práctica y pertinente para digitalizar el registro de intervenciones en Fundación Cristo Vive. Facilita la organización de la información, mejora la trazabilidad y abre la puerta a la generación de indicadores, resúmenes y análisis más completos.

La propuesta representa un punto de partida sólido para una transformación digital gradual, con potencial de crecimiento y adaptación a nuevas necesidades institucionales.
