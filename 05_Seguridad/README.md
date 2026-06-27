# Seguridad y controles del proyecto

## 1. Objetivo
Garantizar que la informacion de intervenciones y pacientes se maneje de forma segura, confiable y con trazabilidad, cumpliendo con los requisitos de proteccion de datos clinicos.

## 2. Controles implementados

### 2.1 Autenticación y autorización

| Control | Implementación | Archivo |
|:---|:---|:---:|
| **Dos niveles de autenticación** | Admin (`usuarios`) y terapeutas (`terapeutas`) con flujos separados | `routes/auth.js`, `routes/profesionales.js` |
| **Contraseñas con bcrypt** | Hash con 12 rondas de sal, migración automática desde texto plano legacy | `utils/passwords.js` |
| **Política de contraseñas seguras** | Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo + confirmación | `views/registroProfesional.ejs`, `routes/profesionales.js:78-86` |
| **Protección de rutas** | Middleware `requireAuth` verifica sesión en cada ruta protegida | `middleware/auth.js` |
| **Regeneración de sesión** | `req.session.regenerate()` al iniciar sesión previene fijación de sesión | `routes/profesionales.js:51` |
| **Roles y permisos** | Terapeuta ve solo sus pacientes; admin ve todo el sistema | `routes/dashboard.js` |
| **Cierre por inactividad** | Modal a los 3 minutos; cierre automático a los 30s sin respuesta | `public/js/inactivity.js` |
| **Redirección segura** | Login login `/` redirige a `/profesionales/login`; logout redirige a login | `routes/auth.js:12-14` |

### 2.2 Protección de base de datos

- **Consultas parametrizadas:** todas las consultas SQL usan placeholders (`?`) para prevenir inyección SQL.
- **Archivo SQLite** ubicado en `database/database.db`, excluido de Git mediante `.gitignore`.
- **Ruta configurable** mediante `DATA_DIR` o `DB_PATH` para entornos institucionales.
- **Backups automáticos** cada 24 horas (`VACUUM INTO`) + backup manual (`npm run db:backup`).
- **Archivos de audio** almacenados en `uploads/`, servidos estáticamente en `/uploads/`.

### 2.3 Confidencialidad

- Las contraseñas nunca se almacenan en texto plano ni se incluyen en objetos de sesión (`stripPassword`).
- Las cookies de sesión usan `httpOnly` y `sameSite=lax` por defecto.
- Separación de datos por terapeuta: cada profesional solo accede a sus propias intervenciones.
- El administrador tiene visibilidad completa para supervisión institucional.
- Los archivos de audio se excluyen del control de versiones.

### 2.4 Validaciones

| Capa | Validaciones |
|:---|:---|
| **Cliente (HTML5)** | `required`, `pattern`, `minlength`, tipo email |
| **Cliente (JavaScript)** | Fortaleza de contraseña, confirmación de coincidencia |
| **Servidor (Express)** | Verificación de campos obligatorios, validación de formato de contraseña |
| **Base de datos** | Consultas parametrizadas, `INSERT OR IGNORE` para evitar duplicados |

## 3. Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|:---|:---:|:---:|:---|
| Acceso no autorizado | Baja | Alto | Autenticación por roles + middleware + sesiones regeneradas |
| Pérdida de datos | Baja | Alto | Backups automáticos cada 24h + backup manual |
| Contraseñas débiles | Media | Alto | Política de complejidad + bcrypt + confirmación + indicador visual |
| Sesión secuestrada | Baja | Alto | Regeneración de sesión + cierre por inactividad (3 min) |
| Inyección SQL | Baja | Crítico | Consultas parametrizadas en todas las operaciones |
| Fuga de información sensible | Baja | Alto | Separación de datos por terapeuta; solo admin ve todo |
| Fuga de archivos de audio | Baja | Medio | Archivos fuera de rutas estáticas públicas; .gitignore |
| Fijación de sesión | Baja | Alto | Regeneración de sesión en cada login |

## 4. Flujo de autenticación completo

```
Usuario no autenticado
       │
       ▼
  ┌─────────────────────────────┐
  │  GET /profesionales/login   │ ← Página de inicio
  │  GET /login-admin           │ ← Admin
  └─────────────┬───────────────┘
                │ POST con credenciales
                ▼
  ┌─────────────────────────────┐
  │  Validar bcrypt / legacy    │
  │  Regenerar sesión           │
  │  ¿aprobado=1? (terapeutas)  │
  └─────────────┬───────────────┘
                │
      ┌─────────┴─────────┐
      ▼                   ▼
  Dashboard           Login denegado
  terapeuta/admin     (error + mensaje)
```

## 5. Recomendaciones para producción

- **HTTPS obligatorio** en producción para cifrar tráfico.
- **Rotar `SESSION_SECRET`** periódicamente.
- **Migrar a PostgreSQL/MySQL** para alta concurrencia.
- **Implementar OAuth 2.0 / 2FA** para fortalecer autenticación.
- **Registro de auditoría** (log de accesos, modificaciones, eliminaciones).
- **Cifrado de base de datos** en reposo (SQLCipher o cifrado a nivel OS).
- **Protección de archivos de audio** con autenticación para servir los archivos.
- **Separación de entornos** desarrollo, pruebas, producción.
- **Monitoreo continuo** de errores e intentos de acceso fallidos.
- **Política de respaldo** con retención de N versiones y prueba de restauración periódica.
