# Seguridad y controles del proyecto

## 1. Objetivo
Garantizar que la información de intervenciones y pacientes se maneje de forma segura, confiable y con trazabilidad.

## 2. Controles de seguridad propuestos
### Autenticación y autorización
- Login con credenciales para acceso al sistema.
- Protección de rutas mediante middleware de autenticación.
- Control de acceso por roles, con posibilidad de ampliar permisos en fases posteriores.

### Integridad de la información
- Validación de campos obligatorios en formularios.
- Almacenamiento estructurado de registros.
- Prevención de registros incompletos o inconsistentes.

### Disponibilidad
- Manejo de errores en la carga de datos.
- Respaldo del estado funcional del MVP.
- Preparación para copias de seguridad y monitoreo en entorno real.

### Confidencialidad
- Acceso restringido a usuarios autenticados.
- Recomendación de usar contraseñas seguras y gestión de sesiones.
- Futuro uso de HTTPS y cifrado en tránsito.

## 3. Riesgos principales
- acceso no autorizado,
- pérdida de información,
- registros duplicados,
- fallas del sistema,
- falta de auditoría.

## 4. Medidas recomendadas
- implementar copias de seguridad periódicas,
- habilitar logs de auditoría,
- usar HTTPS en producción,
- migrar a una base de datos más robusta si crece la carga,
- separar entornos de desarrollo, pruebas y producción.

## 5. Recomendación institucional
La solución actual ofrece una base segura para un MVP; para despliegue real se recomienda fortalecer la seguridad con políticas formales de acceso, respaldo y monitoreo continuo.
