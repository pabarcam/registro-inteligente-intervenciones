# Informe Técnico — Registro Inteligente de Intervenciones

## Talita-Kum · Fundación Cristo Vive

---

## Portada

**Nombre del proyecto:** Registro Inteligente de Intervenciones Talita-Kum

**Integrantes:**

- Paulo Abarca Matamala — Ingeniero Informático (Líder de grupo / Representante)
- [Nombre integrante 2] — [Carrera]
- [Nombre integrante 3] — [Carrera]
- [Nombre integrante 4] — [Carrera]

**Carrera / Área:** Ingeniería de Sistemas / Desarrollo de Software

**Sección:** [Sección correspondiente]

**Representante:** Paulo Abarca Matamala

---

## Resumen de la solución

Fundación Cristo Vive enfrenta la necesidad de contar con un sistema digital que centralice, ordene y proteja el registro de las intervenciones terapéuticas realizadas a sus pacientes. En la actualidad, la información tiende a dispersarse en formatos físicos o archivos sueltos, lo que dificulta la trazabilidad, el seguimiento clínico y la generación de reportes institucionales.

La propuesta desarrollada es una aplicación web funcional (MVP) que permite:

- El registro estructurado de cada intervención terapéutica (descripción de la sesión, objetivo, acuerdos, observaciones).
- La autenticación segmentada por roles: terapeutas y administradores.
- La visualización de un dashboard por paciente con todo su historial clínico.
- La generación automatizada de resúmenes clínicos en formato estructurado de 6 secciones, basados en criterios de Terapia Cognitivo-Conductual (TCC).
- El dictado por voz para agilizar la captura de información durante las sesiones.
- La notificación por correo electrónico con el resumen de cada intervención guardada.
- El cierre automático de sesión por inactividad como medida de seguridad.

Todo esto sobre una arquitectura simple, de bajo costo y fácil instalación, pensada para ser adoptada gradualmente por la institución.

---

## Comprensión del contexto

### Usuario principal

El sistema está diseñado para dos perfiles de usuario:

1. **Terapeuta / Profesional de la salud:** personal que realiza las intervenciones y necesita registrar la información de cada sesión de forma rápida, ordenada y segura. No requiere conocimientos técnicos avanzados.
2. **Administrador del sistema:** encargado de aprobar cuentas de terapeutas, gestionar usuarios y supervisar los registros del sistema.

### Necesidad identificada

Los terapeutas de Fundación Cristo Vive necesitan una herramienta que:

- Les permita registrar intervenciones en el momento, reduciendo la carga administrativa posterior.
- Centralice el historial de cada paciente para facilitar la continuidad del tratamiento.
- Genere resúmenes clínicos que apoyen la toma de decisiones y la revisión de casos.
- Sea accesible desde cualquier computador con navegador web, sin instalaciones complejas.

### Restricciones del entorno

- La institución requiere una solución de **bajo costo** y **mantenimiento simple**.
- No se puede depender de conexión permanente a internet para el funcionamiento base (la aplicación corre localmente).
- La información manejada es sensible (datos clínicos), por lo que la **seguridad y confidencialidad** son prioritarias.
- El personal tiene distintos niveles de familiaridad con herramientas digitales, por lo que la interfaz debe ser **intuitiva y amigable**.

### Escenario de uso típico

1. Un terapeuta inicia sesión en el sistema desde su computador.
2. Accede a su dashboard donde ve la lista de sus pacientes.
3. Selecciona un paciente existente o crea uno nuevo.
4. Completa el formulario de intervención con los datos de la sesión (puede usar dictado por voz).
5. Guarda la intervención. El sistema genera automáticamente un resumen clínico y envía un correo de notificación.
6. Puede consultar en cualquier momento el historial completo del paciente con los resúmenes generados.

---

## Diseño de la solución

### Funcionalidades principales

| Funcionalidad                               | Descripción                                                                                                                                                                              |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autenticación de terapeutas**      | Login con correo y contraseña. Registro de nuevos terapeutas con validación de contraseña segura (mínimo 8 caracteres, mayúscula, número, símbolo). Aprobación por administrador. |
| **Autenticación de administradores** | Login independiente con acceso al panel de gestión de cuentas profesionales.                                                                                                             |
| **Dashboard por terapeuta**           | Vista protegida que muestra solo los pacientes del terapeuta autenticado, con el número de intervenciones y la fecha de la última sesión.                                              |
| **Registro de intervenciones**        | Formulario completo con campos para paciente, fecha, descripción de la entrevista, objetivo terapéutico, acuerdos y observaciones. Soporta autocompletado de pacientes existentes.      |
| **Dictado por voz**                   | Integración con la API de reconocimiento de voz del navegador (Web Speech API) para transcribir la entrevista en tiempo real mientras se graba audio.                                    |
| **Resumen clínico IA (TCC)**         | Generación automática de un resumen estructurado en 6 secciones basado en el historial completo del paciente. Usa API de Groq (gratuita) o fallback local.                              |
| **Historial profesional**             | Vista que permite al terapeuta editar o eliminar sus propias intervenciones.                                                                                                              |
| **Notificaciones por correo**         | Envío automático de un correo con el resumen de la intervención al terapeuta después de guardar.                                                                                      |
| **Cierre por inactividad**            | Si el usuario no interactúa por 3 minutos, se muestra una alerta. Si no responde en 30 segundos, la sesión se cierra automáticamente.                                                  |
| **Panel de administración**          | Gestión de cuentas de terapeutas (aprobar, eliminar) y visualización de todas las intervenciones del sistema.                                                                           |

### Flujo de uso del sistema

```
[Inicio] → Login terapeuta → Dashboard
                                  ↓
                    Seleccionar paciente o crear nuevo
                                  ↓
                    Formulario de intervención (voz opcional)
                                  ↓
                    Guardar → Resumen IA → Notificación email
                                  ↓
                    Dashboard actualizado con nuevo registro
```

### Representación visual del sistema (arquitectura en capas)

```
┌──────────────────────────────────────────────────┐
│                 CAPA PRESENTACIÓN                  │
│        Vistas EJS + Bootstrap + CSS propio         │
│   (login, dashboard, formulario, historial, etc.)  │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                 CAPA DE NEGOCIO                    │
│   Express Router + Middleware (auth, sesiones)     │
│   Módulos: auth, dashboard, intervenciones, voz   │
│   Utilerías: ia.js, passwords.js, mailer.js       │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                 CAPA DE DATOS                      │
│   SQLite (tablas: usuarios, terapeutas, pacientes, │
│   intervenciones, resumenes)                       │
└──────────────────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   API Groq (IA)            Servidor SMTP
   (resúmenes TCC)          (correos)
```

### Detalle de rutas del sistema

| Ruta                                  | Método | Función                             |
| :------------------------------------ | :------: | :----------------------------------- |
| `/`                                 |   GET   | Redirige a`/profesionales/login`   |
| `/profesionales/login`              | GET/POST | Login de terapeutas                  |
| `/profesionales/registro`           | GET/POST | Registro de nuevo terapeuta          |
| `/profesionales/logout`             |   GET   | Cierre de sesión                    |
| `/login-admin`                      | GET/POST | Login de administrador               |
| `/intervenciones/dashboard`         |   GET   | Dashboard con pacientes              |
| `/intervenciones/nueva`             |   GET   | Formulario de nueva intervención    |
| `/intervenciones/guardar`           |   POST   | Guardar intervención                |
| `/intervenciones/paciente/:nombre`  |   GET   | Dashboard individual del paciente    |
| `/intervenciones/editar/:id`        |   POST   | Editar descripción de intervención |
| `/intervenciones/eliminar/:id`      |   POST   | Eliminar intervención               |
| `/profesionales/historial`          |   GET   | Historial del terapeuta              |
| `/profesionales/admin`              |   GET   | Panel de administración             |
| `/profesionales/admin/aprobar/:id`  |   POST   | Aprobar terapeuta                    |
| `/profesionales/admin/eliminar/:id` |   POST   | Eliminar terapeuta                   |

---

## Prototipo o demo

El sistema se encuentra completamente funcional y puede ejecutarse localmente siguiendo las instrucciones del manual de instalación. A continuación se describen las pantallas principales del sistema.

### Pantalla 1 — Login de terapeutas

[CAPTURA: Pantalla de inicio de sesión para terapeutas con logo Talita-Kum, campos de correo y contraseña, botón "Ingresar", enlace a "Crear cuenta profesional" y enlace "Acceso administrador"]

### Pantalla 2 — Registro de nuevo terapeuta

[CAPTURA: Formulario de registro con campos: nombre completo, correo institucional, contraseña con indicador de fortaleza, confirmación de contraseña y especialidad. Incluye validación en tiempo real.]

### Pantalla 3 — Dashboard del terapeuta

[CAPTURA: Vista del dashboard con tarjetas de pacientes, cada una mostrando el nombre, iniciales, número de intervenciones y fecha de última sesión. Botones para nueva intervención, historial y salir.]

### Pantalla 4 — Formulario de nueva intervención

[CAPTURA: Formulario completo con: selector de paciente (autocompletado), fecha automática, área de grabación de audio con botones iniciar/detener/descargar, campo de entrevista con dictado por voz, y campos para objetivo, acuerdos y observaciones.]

### Pantalla 5 — Dashboard del paciente

[CAPTURA: Vista detallada del paciente con: tarjeta de resumen clínico generado por IA (6 secciones TCC) y el historial completo de intervenciones ordenadas cronológicamente.]

### Pantalla 6 — Historial profesional

[CAPTURA: Tabla con todas las intervenciones del terapeuta, con opciones para editar la descripción (modal) y eliminar registros.]

### Pantalla 7 — Login de administrador

[CAPTURA: Pantalla de acceso para administradores con logo Talita-Kum y enlace para volver al login profesional.]

### Pantalla 8 — Panel de administración

[CAPTURA: Panel con dos secciones: tabla de cuentas profesionales (nombre, correo, especialidad, estado, acciones aprobar/eliminar) y tabla de intervenciones registradas con opción de borrar.]

### Pantalla 9 — Alerta de inactividad

[CAPTURA: Modal emergente que dice "¿Deseas continuar con la sesión?" con botones "Sí, continuar" y "Cerrar sesión", que aparece después de 3 minutos sin actividad.]

### Pantalla 10 — Correo de notificación

[CAPTURA: Ejemplo del correo electrónico que recibe el terapeuta después de guardar una intervención, con el resumen clínico en formato estructurado.]

---

## Arquitectura y tecnologías

### Stack tecnológico

| Componente                      | Tecnología                      | Versión | Propósito                              |
| :------------------------------ | :------------------------------- | :------: | :-------------------------------------- |
| **Entorno de ejecución** | Node.js                          |   18+   | Plataforma del servidor backend         |
| **Framework web**         | Express                          |  5.2.1  | Enrutamiento, middleware, sesiones      |
| **Motor de plantillas**   | EJS                              |  6.0.1  | Renderizado de vistas HTML              |
| **Base de datos**         | SQLite                           |  5.1.1  | Almacenamiento local embebido           |
| **Hash de contraseñas**  | bcryptjs                         |  2.4.3  | Protección de credenciales             |
| **Sesiones**              | express-session                  |  1.18.1  | Manejo de sesiones de usuario           |
| **Correo electrónico**   | Nodemailer                       |  6.9.16  | Notificaciones SMTP                     |
| **IA (resúmenes)**       | Groq API (Llama 3 70B)           |    —    | Generación de resúmenes clínicos TCC |
| **Reconocimiento de voz** | Web Speech API                   |    —    | Dictado en vivo en el navegador         |
| **Frontend CSS**          | Bootstrap 5.3.3 + CSS propio     |    —    | Interfaz responsive y estilizada        |
| **Tipografía**           | Merriweather + Merriweather Sans |    —    | Fuentes institucionales                 |

### Estructura del proyecto

```
talita-kum-app/
├── server.js                 # Punto de entrada
├── config/
│   ├── db.js                 # Inicialización SQLite + esquema
│   └── paths.js              # Rutas de datos/backups
├── middleware/
│   └── auth.js               # Middleware de autenticación
├── routes/
│   ├── auth.js               # Rutas de autenticación admin
│   ├── dashboard.js          # Dashboard + vista paciente
│   ├── intervenciones.js     # CRUD de intervenciones
│   ├── profesionales.js      # Login/registro terapeutas + admin
│   └── voice.js              # Proxy de transcripción externa
├── utils/
│   ├── ia.js                 # Agente de resumen IA + fallback local
│   ├── summaryCache.js       # Caché de resúmenes en SQLite
│   ├── passwords.js          # Hashing bcrypt + migración legacy
│   ├── mailer.js             # Envío de correos SMTP
│   └── backups.js            # Respaldo programado de BD
├── views/                    # 11 plantillas EJS
├── public/
│   ├── js/
│   │   ├── voice.js          # Dictado por voz (legacy)
│   │   ├── voice-api.js      # Dictado por voz (refinado)
│   │   └── inactivity.js     # Cierre por inactividad
│   └── img/
│       └── talita-kum-logo.png
├── scripts/
│   ├── backup-db.js          # Backup manual
│   ├── restore-db.js         # Restauración de backup
│   └── seed_data.js          # Datos de prueba
├── tests/
│   ├── summary.test.js       # Tests del módulo de resúmenes
│   └── passwords.test.js     # Tests del módulo de contraseñas
├── database/
│   └── database.db           # Base de datos SQLite
├── docs/
│   ├── integracion-ia.md     # Documentación de integración IA
│   └── estado-revision.md    # Estado del proyecto
└── .env                      # Variables de entorno
```

### Base de datos (esquema SQLite)

El sistema utiliza 5 tablas principales:

- **usuarios** — Cuentas de administrador (id, nombre, correo, password, rol)
- **terapeutas** — Cuentas de profesionales (id, nombre, correo, password, especialidad, aprobado)
- **pacientes** — Registro de pacientes (id, nombre)
- **intervenciones** — Intervenciones terapéuticas (id, paciente, terapeuta, fecha, descripcion, objetivo, acuerdos, observaciones, audio_path)
- **resumenes** — Caché de resúmenes clínicos (id, paciente, resumen, fecha_actualizacion)

### Integración con IA (Groq)

El sistema se conecta a la API de Groq (gratuita) usando el modelo `llama3-70b-8192` para generar resúmenes clínicos estructurados. El prompt de sistema sigue estrictamente los criterios de Terapia Cognitivo-Conductual (TCC). Si la API no está configurada o no responde, el sistema utiliza un **fallback local** que genera el mismo formato de 6 secciones mediante heurística basada en palabras clave clínicas.

### Justificación de tecnologías

| Decisión                                     | Justificación                                                                                                                 |
| :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **SQLite en lugar de MySQL/PostgreSQL** | No requiere servidor de base de datos separado, ideal para un MVP. El archivo .db se puede respaldar fácilmente.              |
| **EJS en lugar de React/Vue**           | Menor complejidad técnica, renderizado del lado del servidor, sin necesidad de compilación ni dependencias frontend pesadas. |
| **Groq en lugar de OpenAI/DeepSeek**    | Ofrece un tier gratuito generoso con modelos de alta calidad (Llama 3 70B), compatible con la API de chat completions.         |
| **bcryptjs para contraseñas**          | Estándar de la industria para hash seguro de contraseñas con sal automática.                                                |

---

## Seguridad y protección de datos

### Autenticación y control de acceso

- **Dos niveles de autenticación:** administradores (tabla `usuarios`) y terapeutas (tabla `terapeutas`), cada uno con su propio flujo de login.
- **Contraseñas protegidas con bcrypt:** todas las contraseñas se almacenan con hash bcrypt (12 rondas de sal) antes de ser guardadas en la base de datos.
- **Política de contraseñas seguras:** en el registro de terapeutas se exige mínimo 8 caracteres, al menos 1 mayúscula, 1 número y 1 símbolo. Validación tanto en cliente (HTML5 + JavaScript) como en servidor.
- **Confirmación de contraseña:** el registro requiere tipear la contraseña dos veces y ambas deben coincidir.
- **Sesiones con regeneración:** al iniciar sesión, la sesión se regenera (`req.session.regenerate()`) para prevenir fijación de sesión.
- **Middleware de protección:** todas las rutas que requieren autenticación están protegidas por el middleware `requireAuth`, que redirige al login si no hay sesión activa.

### Roles y permisos

| Rol                     | Acceso                                                            | Permisos                                                                             |
| :---------------------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Terapeuta**     | Dashboard propio, formulario de intervención, historial personal | Ver solo sus pacientes e intervenciones. Editar/eliminar solo sus propios registros. |
| **Administrador** | Panel de administración, dashboard global                        | Ver todas las intervenciones. Aprobar/eliminar cuentas de terapeutas.                |

### Validaciones implementadas

- **Del lado del cliente:** HTML5 (`required`, `pattern`, `minlength`), JavaScript con feedback visual en tiempo real (fortaleza de contraseña, confirmación).
- **Del lado del servidor:** todas las validaciones se replican en el backend para evitar manipulación. Sanitización de entradas con `trim()`.
- **Campos obligatorios:** paciente, terapeuta, fecha, descripción — validados antes de insertar.
- **Protección contra inyección SQL:** todas las consultas usan parámetros posicionales (`?`) con `db.run()` y `db.get()`.

### Almacenamiento seguro

- Las contraseñas nunca se almacenan en texto plano. El sistema incluye un mecanismo de migración transparente desde contraseñas legacy (texto plano) a bcrypt.
- Los datos de sesión no incluyen el hash de la contraseña (se elimina con `stripPassword()` antes de guardar en `req.session`).
- La base de datos SQLite se almacena localmente sin exponerse al exterior.
- Los archivos de audio se guardan en el directorio `uploads/` y se referencian por ruta.

### Cierre de sesión por inactividad

- El sistema monitorea la actividad del usuario (mouse, teclado, scroll, touch).
- Después de **3 minutos** sin interacción, se muestra un modal con el mensaje: *"¿Deseas continuar con la sesión? Has estado inactivo por 3 minutos. Si no respondes, la sesión se cerrará automáticamente."*
- Si el usuario hace clic en **"Sí, continuar"**, el temporizador se reinicia.
- Si hace clic en **"Cerrar sesión"** o no responde en **30 segundos**, se redirige a `/logout`.

### Trazabilidad

- Cada intervención registra el nombre del terapeuta que la realizó y la fecha exacta.
- El administrador puede visualizar todas las intervenciones del sistema ordenadas por fecha.
- Los resúmenes clínicos se almacenan en caché con marca de tiempo de última actualización.

### Riesgos mitigados

| Riesgo                        | Mitigación                                                  |
| :---------------------------- | :----------------------------------------------------------- |
| Acceso no autorizado          | Autenticación por roles + middleware + sesiones regeneradas |
| Pérdida de datos             | Backups automáticos programados + backup manual             |
| Contraseñas débiles         | Política de complejidad + bcrypt + confirmación            |
| Sesión secuestrada           | Regeneración de sesión en login + cierre por inactividad   |
| Inyección SQL                | Consultas parametrizadas en todas las operaciones            |
| Fuga de información sensible | Separación de datos por terapeuta, solo admin ve todo       |

---

## Uso de datos

### Indicadores que el sistema puede generar

La plataforma, aunque enfocada en el registro, permite obtener indicadores de alto valor para la institución:

| Indicador                           | Fuente de datos                                       | Valor institucional                                |
| :---------------------------------- | :---------------------------------------------------- | :------------------------------------------------- |
| Número de intervenciones por mes   | Tabla`intervenciones`, campo `fecha`              | Medir volumen de atención y estacionalidad        |
| Intervenciones por terapeuta        | Tabla`intervenciones`, campo `terapeuta`          | Evaluar carga laboral y productividad              |
| Pacientes atendidos por período    | Tabla`intervenciones`, agrupación por `paciente` | Cobertura de atención                             |
| Evolución por paciente             | Historial de intervenciones + resúmenes TCC          | Seguimiento clínico y efectividad del tratamiento |
| Nivel de criticidad por caso        | Resúmenes (Baja, Moderada, Alta, Crítica)           | Priorización de casos urgentes                    |
| Adherencia al tratamiento           | Acuerdos entre sesiones (campo`acuerdos`)           | Evaluar cumplimiento de tareas terapéuticas       |
| Sesiones con soporte de audio       | Campo`audio_path` no nulo                           | Porcentaje de sesiones grabadas                    |
| Terapeutas vs pacientes activos     | Tablas`terapeutas` e `intervenciones`             | Ratio de atención                                 |
| Tasa de registro exitoso vs errores | Logs del sistema + número de intervenciones          | Monitoreo de calidad del registro                  |

### Reportes y análisis potenciales

- **Reporte mensual de actividad:** total de intervenciones, pacientes únicos atendidos, terapeutas activos.
- **Ficha clínica por paciente:** historial completo + resumen evolutivo con las 6 secciones TCC.
- **Alertas de criticidad:** casos clasificados como "Alta" o "Crítica" que requieren atención prioritaria.
- **Análisis de adherencia:** seguimiento de acuerdos y tareas entre sesiones para cada paciente.

### Valor agregado del resumen clínico TCC

El resumen estructurado en 6 secciones no solo organiza la información, sino que aplica criterios clínicos de Terapia Cognitivo-Conductual:

1. **Intervenciones y fechas** → Línea de tiempo del tratamiento.
2. **Criticidad** → Triaje clínico automatizado para priorización.
3. **Datos importantes de sesiones anteriores** → Memoria clínica sin releer todo el historial.
4. **Datos importantes de la última sesión** → Estado actual del paciente.
5. **Avance entre sesiones** → Medición objetiva de progreso terapéutico.
6. **Enfoque TCC y temas de atención** → Identificación de patrones cognitivos y conductuales.

### Privacidad en el uso de datos

- Los datos clínicos nunca salen del sistema hacia la nube a menos que se configure explícitamente la API de IA (y en ese caso, se recomienda evaluar cumplimiento normativo).
- El terapeuta solo ve los datos de sus propios pacientes.
- El administrador tiene visibilidad completa para fines de supervisión institucional.
- Los resúmenes generados por IA se almacenan localmente en la base de datos SQLite.

---

## Viabilidad

### Factibilidad técnica

**Alta.** El MVP se encuentra completamente funcional con:

- Flujo completo de autenticación, registro, almacenamiento y consulta.
- 7 pruebas unitarias automatizadas que verifican los módulos críticos (passes: 7/7).
- Código modular, documentado y fácil de mantener.
- Sin dependencias de servicios externos para el funcionamiento base.
- La integración con IA es opcional y tiene un fallback local que no interrumpe el servicio.

Requisitos técnicos mínimos:

- Node.js 18+ instalado.
- 256 MB de RAM disponibles.
- 50 MB de espacio en disco.
- Navegador web moderno (Chrome, Edge, Firefox).

### Factibilidad operativa

**Alta.** La solución está diseñada para ser operada por personal no técnico:

- Interfaz limpia, intuitiva y en español.
- El login y registro son autogestionados por los terapeutas (el administrador solo aprueba).
- El formulario de intervención guía al usuario paso a paso.
- No requiere mantenimiento especializado más que backups periódicos.
- El manual de instalación documenta el proceso completo en 5 pasos.

### Costos aproximados

| Concepto                           | Costo                                              |
| :--------------------------------- | :------------------------------------------------- |
| Servidor (computador existente)    | $0 (usa infraestructura actual)                    |
| Software (todo open source)        | $0                                                 |
| API de IA (Groq, tier gratuito)    | $0 (30 requests/minuto, 1440 requests/día gratis) |
| Correo SMTP (Gmail App Password)   | $0                                                 |
| Dominio (opcional)                 | $0–$15/año                                       |
| **Total operación mensual** | **~$0**                                      |

### Limitaciones actuales

1. **Base de datos local (SQLite):** no está diseñada para alta concurrencia. Para múltiples usuarios simultáneos se recomienda migrar a PostgreSQL o MySQL.
2. **Autenticación básica:** no implementa OAuth, 2FA ni integración con directorio activo (LDAP).
3. **Sin API REST pública:** el sistema no expone endpoints para integración con otros sistemas institucionales.
4. **Dependencia del navegador para dictado por voz:** la calidad de la transcripción varía según el navegador y el entorno.
5. **Sin cifrado de datos en reposo:** la base de datos SQLite no está cifrada. En producción se recomienda cifrado a nivel de sistema de archivos.
6. **Sin registro de auditoría centralizado:** las acciones de los usuarios no quedan registradas en un log de auditoría independiente.

### Próximos pasos recomendados

| Prioridad | Mejora                                                           | Impacto                                |
| :-------: | :--------------------------------------------------------------- | :------------------------------------- |
|     1     | Migrar a base de datos PostgreSQL o MySQL                        | Concurrencia, escalabilidad, respaldos |
|     2     | Implementar HTTPS con certificado SSL/TLS                        | Seguridad en tránsito                 |
|     3     | Agregar autenticación de dos factores (2FA)                     | Seguridad de cuentas                   |
|     4     | Implementar registro de auditoría (logs de acciones)            | Trazabilidad institucional             |
|     5     | Conectar API de transcripción profesional (Whisper, AssemblyAI) | Precisión de dictado                  |
|     6     | Desarrollar panel de reportes e indicadores visuales (gráficos) | Toma de decisiones                     |
|     7     | Crear aplicación móvil o PWA                                   | Acceso desde dispositivos móviles     |
|     8     | Implementar exportación de datos (PDF, Excel)                   | Reportes institucionales               |

---

## Conclusiones

### Aporte de la solución

El Registro Inteligente de Intervenciones Talita-Kum representa un avance concreto en la digitalización de los procesos clínicos de Fundación Cristo Vive. La solución aborda las necesidades fundamentales identificadas:

- **Centraliza la información clínica** eliminando la dispersión de registros en formatos físicos o archivos sueltos.
- **Mejora la continuidad del tratamiento** mediante resúmenes clínicos estructurados que permiten a cualquier terapeuta retomar un caso con información clara y organizada.
- **Fortalece la seguridad** con autenticación por roles, contraseñas robustas, sesiones protegidas y cierre automático por inactividad.
- **Reduce la carga administrativa** del personal mediante dictado por voz y generación automatizada de resúmenes.
- **Facilita la supervisión institucional** con paneles de administración y capacidad de generar indicadores de gestión.

El sistema ha sido diseñado con un enfoque centrado en el usuario terapeuta, priorizando la facilidad de uso sin sacrificar la seguridad ni la calidad de los datos. La elección de tecnologías open source y la arquitectura modular garantizan que la institución pueda mantener y evolucionar la solución sin depender de proveedores externos.

### Mejoras futuras

A corto plazo, las prioridades son migrar a una base de datos más robusta, implementar HTTPS y agregar autenticación de dos factores. A mediano plazo, se recomienda desarrollar un panel de reportes visuales, integración con sistemas de transcripción profesional y una interfaz móvil.

La base tecnológica actual permite estas evoluciones sin necesidad de reescribir el sistema desde cero, lo que convierte a este MVP en una inversión sólida y sostenible para la transformación digital de Fundación Cristo Vive.

---

*Documento generado como parte del proyecto Registro Inteligente de Intervenciones — Talita-Kum, para Fundación Cristo Vive.*
