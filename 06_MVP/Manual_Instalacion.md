# Manual de instalacion del MVP

## 1. Requisitos previos
- Node.js 18 o superior
- npm
- Git
- Acceso a una terminal

## 2. Clonar y entrar al proyecto
```bash
git clone <url-del-repositorio>
cd registro-inteligente-intervenciones/06_MVP/Codigo_Fuente/talita-kum-app
```

## 3. Instalar dependencias
```bash
npm install
```

## 4. Variables de entorno recomendadas
Crear un archivo `.env` en `06_MVP/Codigo_Fuente/talita-kum-app`:
```env
SESSION_SECRET=generar-un-secreto-largo-y-unico
DATA_DIR=./data
BACKUP_INTERVAL_HOURS=24
```

Opcionalmente se puede definir una ruta exacta de base de datos:
```env
DB_PATH=/ruta/segura/database.db
BACKUP_DIR=/ruta/segura/backups
```

## 5. Ejecutar la aplicacion
```bash
npm start
```

La aplicacion quedara disponible en:
- http://localhost:3000

## 6. Credenciales de acceso inicial
El sistema crea un usuario demo al iniciar por primera vez:
- correo: `admin@talita.com`
- contrasena: `123456`

La contrasena se guarda como hash bcrypt irreversible en la base de datos.

## 7. Ejecutar pruebas
```bash
npm test
```

## 8. Variables de entorno opcionales para IA
Para activar la integracion con una API de IA tipo Qwen, configurar:
```env
AI_SUMMARY_API_URL=...
AI_SUMMARY_API_KEY=...
AI_SUMMARY_MODEL=qwen-plus
```

Si no se configuran, la aplicacion usara el mecanismo de resumen local como respaldo.

## 9. Respaldos y restauracion
Crear respaldo manual:
```bash
npm run db:backup
```

Restaurar un respaldo con la aplicacion detenida:
```bash
npm run db:restore -- /ruta/al/respaldo.db
```

El proceso de restauracion crea primero una copia `pre-restore-*.db` de la base activa.

## 10. Estructura relevante del proyecto
- `server.js`: punto de entrada del sistema.
- `routes/`: controladores de login, dashboard e intervenciones.
- `views/`: plantillas de interfaz.
- `public/js/`: scripts del navegador, incluido reconocimiento de voz.
- `config/db.js`: inicializacion de la base de datos SQLite.
- `config/paths.js`: rutas seguras/configurables para datos y respaldos.
- `utils/passwords.js`: hashing y verificacion bcrypt.
- `utils/backups.js`: creacion de respaldos.

## 11. Solucion de problemas comunes
- Si no inicia, revisar que Node.js este instalado correctamente.
- Si no aparece la interfaz, comprobar que el puerto 3000 este libre.
- Si la app no genera resumenes con IA, no es un error critico; el sistema usara el fallback local.
- Si se restaura un respaldo, detener la aplicacion antes de ejecutar `npm run db:restore`.
