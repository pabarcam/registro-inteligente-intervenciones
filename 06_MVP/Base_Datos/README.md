# Base de datos del MVP

## Contenido
- `schema.sql`: script de creacion de tablas del sistema.
- `data/database.db`: archivo SQLite generado por la aplicacion en ejecucion.
- `data/backups/`: respaldos generados por la aplicacion o por `npm run db:backup`.

## Tablas principales
- `usuarios`: autenticacion y gestion de accesos. Las contrasenas se guardan como hash bcrypt irreversible.
- `pacientes`: registro de pacientes vinculados a intervenciones.
- `intervenciones`: datos principales de cada intervencion terapeutica.
- `resumenes`: cache de resumenes IA por paciente.

## Datos iniciales
Usuario demo para pruebas:
- correo: `admin@talita.com`
- contrasena: `123456`

La contrasena demo se inserta como hash bcrypt. Si existe una base antigua con contrasenas en texto plano, la aplicacion las migra automaticamente a bcrypt al iniciar.

## Seguridad operacional
- Las consultas de la aplicacion usan parametros (`?`) para reducir riesgo de inyeccion SQL.
- Las rutas privadas requieren sesion de usuario mediante middleware de autenticacion.
- Configurar `SESSION_SECRET` en produccion; no usar el valor de desarrollo.
- Configurar `DATA_DIR` o `DB_PATH` a una ruta local no publica, con permisos restringidos al usuario que ejecuta Node.js.

## Respaldos y restauracion
Crear un respaldo manual:
```bash
npm run db:backup
```

Los respaldos periodicos se crean cada 24 horas por defecto en `data/backups/`. Puede ajustarse con:
```env
BACKUP_INTERVAL_HOURS=24
BACKUP_DIR=/ruta/segura/backups
```

Restaurar un respaldo con la aplicacion detenida:
```bash
npm run db:restore -- /ruta/al/respaldo.db
```

Antes de restaurar, el script crea una copia `pre-restore-*.db` de la base activa en la carpeta de respaldos.
