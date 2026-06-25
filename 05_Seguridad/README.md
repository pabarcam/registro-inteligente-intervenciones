# Seguridad y controles del proyecto

## 1. Objetivo
Garantizar que la informacion de intervenciones y pacientes se maneje de forma segura, confiable y con trazabilidad.

## 2. Controles implementados
### Autenticacion y autorizacion
- Login con credenciales para acceso al sistema.
- Contrasenas almacenadas con hash bcrypt irreversible.
- Migracion automatica de contrasenas antiguas en texto plano hacia bcrypt al iniciar.
- Proteccion de rutas mediante middleware de autenticacion.
- Restriccion por sesion: terapeutas ven y modifican solo sus intervenciones; administracion conserva acceso global.
- Regeneracion de sesion al iniciar sesion para reducir riesgo de fijacion de sesion.
- Cookies de sesion `httpOnly`, `sameSite=lax`, expiracion de 8 horas y `secure` en produccion.

### Proteccion de base de datos
- Consultas SQL parametrizadas con placeholders (`?`) para reducir riesgo de inyeccion SQL.
- Archivo SQLite ubicado por defecto en `data/database.db`, fuera de rutas estaticas publicas.
- Ruta configurable mediante `DATA_DIR` o `DB_PATH` para usar una ubicacion institucional con permisos restringidos.
- Datos locales, respaldos y uploads excluidos de Git mediante `.gitignore`.

### Disponibilidad
- Respaldos periodicos cada 24 horas por defecto.
- Respaldo manual con `npm run db:backup`.
- Restauracion con `npm run db:restore -- /ruta/al/respaldo.db`.
- Copia previa automatica antes de restaurar una base activa.

### Confidencialidad
- Acceso restringido a usuarios autenticados.
- No se guardan hashes de contrasena dentro de la sesion.
- Recomendacion de usar HTTPS en produccion.

## 3. Riesgos principales
- acceso no autorizado,
- perdida de informacion,
- registros duplicados,
- fallas del sistema,
- falta de auditoria.

## 4. Medidas recomendadas
- habilitar logs de auditoria,
- usar HTTPS en produccion,
- proteger filesystem con permisos del sistema operativo,
- rotar `SESSION_SECRET` si se sospecha exposicion,
- migrar a una base de datos mas robusta si crece la carga,
- separar entornos de desarrollo, pruebas y produccion.

## 5. Recomendacion institucional
La solucion actual ofrece una base segura para un MVP. Para despliegue real se recomienda formalizar politicas de acceso, respaldo, monitoreo continuo y auditoria.
