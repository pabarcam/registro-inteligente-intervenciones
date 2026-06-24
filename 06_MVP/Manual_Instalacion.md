# Manual de instalación del MVP

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

## 4. Ejecutar la aplicación
```bash
npm start
```

La aplicación quedará disponible en:
- http://localhost:3000

## 5. Credenciales de acceso inicial
El sistema crea un usuario demo al iniciar por primera vez:
- correo: admin@talita.com
- contraseña: 123456

## 6. Ejecutar pruebas
```bash
npm test
```

## 7. Variables de entorno opcionales para IA
Para activar la integración con una API de IA tipo Qwen, configurar:
```env
AI_SUMMARY_API_URL=...
AI_SUMMARY_API_KEY=...
AI_SUMMARY_MODEL=qwen-plus
```

Si no se configuran, la aplicación usará el mecanismo de resumen local como respaldo.

## 8. Estructura relevante del proyecto
- server.js: punto de entrada del sistema
- routes/: controladores de login, dashboard e intervenciones
- views/: plantillas de interfaz
- public/js/: scripts del navegador, incluido reconocimiento de voz
- config/db.js: inicialización de la base de datos SQLite

## 9. Solución de problemas comunes
- Si no inicia, revisar que Node.js esté instalado correctamente.
- Si no aparece la interfaz, comprobar que el puerto 3000 esté libre.
- Si la app no genera resúmenes con IA, no es un error crítico; el sistema usará el fallback local.
