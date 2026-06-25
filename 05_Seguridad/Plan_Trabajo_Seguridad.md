# Plan de trabajo de seguridad para el MVP

## 1. Objetivo
Establecer un plan de mejora de seguridad para el sistema de registro inteligente de intervenciones, con foco en una segunda etapa del proyecto.

## 2. Alcance inicial
El plan contempla las áreas más relevantes para proteger la información y fortalecer la confiabilidad del sistema.

## 3. Áreas de trabajo
### 3.1 Autenticación y acceso
- Fortalecer el proceso de login.
- Implementar contraseñas más seguras.
- Definir roles claros para usuarios y administradores.
- Restringir el acceso a funciones sensibles.

### 3.2 Protección de datos
- Usar HTTPS en producción.
- Proteger la información en tránsito y en reposo.
- Evitar exposición innecesaria de datos en pantallas y logs.

### 3.3 Integridad y trazabilidad
- Registrar eventos de acceso y cambios.
- Mantener un historial de registros modificados.
- Validar que los datos ingresados sean consistentes.

### 3.4 Respaldo y continuidad
- Crear copias de seguridad periódicas de la base de datos.
- Definir un procedimiento de restauración.
- Preparar un plan ante fallas del sistema.

### 3.5 Seguridad operativa
- Revisar permisos del servidor.
- Limitar accesos por usuario y por entorno.
- Mantener el sistema actualizado.
- Establecer monitoreo básico de errores y accesos.

## 4. Prioridades recomendadas
1. Autenticación y control de accesos.
2. Protección de la información sensible.
3. Respaldo y recuperación.
4. Auditoría y trazabilidad.
5. Seguridad en despliegue y entorno de producción.

## 5. Entregables esperados
- matriz de riesgos,
- políticas básicas de acceso,
- procedimiento de respaldo,
- esquema de roles,
- propuesta de mejora para despliegue seguro.

## 6. Recomendación para el equipo de ciberseguridad
Se sugiere que el equipo revise el sistema desde una visión de:
- confidencialidad,
- integridad,
- disponibilidad,
- y trazabilidad.

Este plan permite contrastar la propuesta actual con un enfoque de seguridad más sólido y preparado para un entorno real.
