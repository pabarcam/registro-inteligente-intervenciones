# Informe de pruebas — Talita-Kum MVP

**Versión:** 1.3  
**Fecha:** 2026-06-26  
**Responsable:** Equipo de desarrollo  

---

## 1. Resumen ejecutivo

Se ejecutaron **7 pruebas unitarias** sobre los módulos críticos del sistema.  
**Resultado: 7/7 exitosas (100%)**. No se detectaron fallos en los componentes evaluados.

Adicionalmente se realizó una auditoría funcional completa que identificó y corrigió 4 rutas faltantes y 2 bugs en el flujo de eliminación/edición de intervenciones.

---

## 2. Pruebas unitarias

### 2.1 Módulo: passwords (`tests/passwords.test.js`)

| # | Caso | Resultado | Verifica |
|---|------|-----------|----------|
| 1 | `hashPassword` genera hashes bcrypt verificables | ✅ | Hash irreversible, no contiene la contraseña original, `verifyPassword` funciona |
| 2 | `isLegacyPlaintextMatch` permite migrar contraseñas antiguas | ✅ | Solo acepta texto plano coincidente, rechaza hash bcrypt |
| 3 | `stripPassword` evita guardar hashes en sesión | ✅ | El objeto resultado no incluye campo `password` |

### 2.2 Módulo: resumen IA (`tests/summary.test.js`)

| # | Caso | Resultado | Verifica |
|---|------|-----------|----------|
| 4 | `buildPatientSummary` incluye las 6 secciones estructuradas | ✅ | Las 6 secciones `SUMMARY_SECTIONS` están presentes en el resumen |
| 5 | `buildPatientSummary` maneja registros vacíos | ✅ | Responde con mensaje "sin registros" |
| 6 | `buildPatientSummary` evalúa criticidad en fallback local | ✅ | Incluye sección de Criticidad con valor Baja/Moderada/Alta/Crítica |
| 7 | `buildPatientSummaryAsync` usa fallback local sin API | ✅ | Sin variables de entorno configuradas, usa generador local |

---

## 3. Auditoría funcional

### 3.1 Rutas verificadas

| Ruta | Método | Estado | Observaciones |
|------|--------|--------|--------------|
| `/intervenciones/nueva` | GET | ✅ | Renderiza formulario de nueva intervención |
| `/intervenciones/guardar` | POST | ✅ | Guarda con audio y genera resumen IA |
| `/intervenciones/dashboard` | GET | ✅ | Dashboard con pacientes agrupados |
| `/intervenciones/paciente/:nombre` | GET | ✅ | Dashboard individual del paciente |
| `/intervenciones/eliminar/:id` | POST | ✅ | Elimina vía fetch, responde JSON |
| `/intervenciones/editar/:id` | POST | ✅ | Edita descripción, regenera resumen IA |
| `/intervenciones/api/pacientes` | GET | ✅ | Autocomplete pacientes existentes |
| `/profesionales/login` | GET/POST | ✅ | Login con bcrypt y migración legacy |
| `/profesionales/registro` | GET/POST | ✅ | Validación de contraseña segura |
| `/profesionales/historial` | GET | ✅ | Historial con modal propio |
| `/profesionales/admin` | GET | ✅ | Panel con aprobar/eliminar profesionales |
| `/profesionales/admin/aprobar/:id` | POST | ✅ | Aprueba cuenta profesional |
| `/profesionales/admin/eliminar/:id` | POST | ✅ | Elimina cuenta e intervenciones asociadas |
| `/login-admin` | GET/POST | ✅ | Login administrador |
| `/logout` | GET | ✅ | Destruye sesión |

### 3.2 Componentes de seguridad verificados

| Componente | Archivo | Estado |
|------------|---------|--------|
| Middleware `requireAuth` | `middleware/auth.js` | ✅ |
| Hash bcrypt (12 rondas) + migración legacy | `utils/passwords.js` | ✅ |
| Regeneración de sesión en login | `routes/profesionales.js:51` | ✅ |
| Cierre por inactividad (3 min) | `public/js/inactivity.js` | ✅ |
| Separación de datos por terapeuta | `routes/dashboard.js` | ✅ |
| Consultas parametrizadas | Todos los routes | ✅ |
| Validación de contraseña (8+ chars, mayúscula, número, símbolo) | `routes/profesionales.js:78-86` | ✅ |

### 3.3 Ventanas emergentes (modales)

| Vista | Modal | Tipo |
|-------|-------|------|
| `historialProfesional.ejs` | Editar descripción | Modal propio CSS |
| `historialProfesional.ejs` | Confirmar eliminación | Modal propio CSS |
| `adminPanel.ejs` | Eliminar intervención | Modal propio CSS |
| `adminPanel.ejs` | Eliminar profesional | Modal propio CSS |

---

## 4. Pruebas de integración

### 4.1 Flujo completo de intervención

```
Login terapeuta → Dashboard → Nueva intervención
  → Ingresar paciente (con autocomplete + ambos apellidos)
  → Grabar audio / escribir transcripción
  → Guardar → Resumen IA generado automáticamente
  → Dashboard actualizado → Historial profesional
  → Editar / Eliminar (modal, sin recarga)
```

### 4.2 Flujo de administración

```
Login admin → Dashboard admin → Panel administración
  → Aprobar cuenta profesional
  → Eliminar cuenta profesional (con intervenciones asociadas)
  → Eliminar intervención
```

### 4.3 Flujo de seguridad

```
Login con credenciales inválidas → Mensaje de error, sin sesión
Login con cuenta no aprobada → Mensaje "cuenta no aprobada"
Acceso directo a ruta protegida → Redirección a login
Inactividad 3 min → Modal de cierre de sesión
```

---

## 5. Incidencias corregidas

| ID | Incidencia | Solución | Archivos modificados |
|----|-----------|----------|---------------------|
| INC-01 | `POST /intervenciones/eliminar/:id` no existía | Ruta agregada con verificación por rol | `routes/intervenciones.js` |
| INC-02 | `POST /intervenciones/editar/:id` no existía | Ruta agregada con regeneración de resumen IA | `routes/intervenciones.js` |
| INC-03 | `GET /intervenciones/api/pacientes` no existía | Endpoint de autocomplete agregado | `routes/intervenciones.js` |
| INC-04 | Eliminación vía `res.redirect` incompatible con fetch | Cambiado a `res.json()` | `routes/intervenciones.js`, `routes/profesionales.js` |
| INC-05 | `closeDelete()` nullificaba ID antes de usarlo | Guardado en variable local antes de cerrar modal | `views/historialProfesional.ejs` |
| INC-06 | Panel admin usaba `confirm()` nativo | Reemplazado por modal propio con fetch | `views/adminPanel.ejs` |
| INC-07 | Placeholders faltantes en formularios | Agregados a login y registro profesional | `views/loginProfesional.ejs`, `views/loginAdmin.ejs`, `views/registroProfesional.ejs` |

---

## 6. Cobertura

| Módulo | Archivos | Cobertura |
|--------|----------|-----------|
| Autenticación | `routes/auth.js`, `routes/profesionales.js` | Manual + unitaria |
| Contraseñas | `utils/passwords.js` | Unitaria (3 tests) |
| Resumen IA | `utils/ia.js` | Unitaria (4 tests) |
| Dashboard | `routes/dashboard.js` | Manual |
| Intervenciones | `routes/intervenciones.js` | Manual |
| Vistas | `views/*.ejs` | Manual |
| Middleware | `middleware/auth.js` | Manual |
| Inactividad | `public/js/inactivity.js` | Manual |

---

## 7. Recomendaciones

1. Agregar pruebas unitarias para `routes/intervenciones.js` (guardar, eliminar, editar)
2. Agregar pruebas de integración con base de datos en memoria (SQLite `:memory:`)
3. Implementar pruebas E2E con Playwright o Cypress para flujos completos
4. Agregar prueba de recuperación ante fallo de API de resumen IA
5. Automatizar pruebas en pipeline CI/CD
