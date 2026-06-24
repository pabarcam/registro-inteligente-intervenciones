# Diagrama y flujo del sistema

## 1. Diagramas disponibles
La carpeta contiene los principales artefactos visuales del proyecto:
- Casos_Uso.png: muestra los actores y las acciones principales del sistema.
- Flujo_Proceso.png: representa el proceso de registro y seguimiento.
- Modelo_ER.png: describe la estructura de datos del sistema.
- Roles_Permisos.png: ilustra los permisos por rol.
- Secuencia_Registro.png: detalla el flujo de registro desde la interfaz hasta la persistencia.

## 2. Descripción del flujo principal
1. Un usuario ingresa al sistema.
2. El sistema valida el acceso.
3. Se accede al formulario de nueva intervención.
4. El usuario captura la información, pudiendo usar registro por voz.
5. La información se valida y se guarda.
6. El sistema muestra la intervención registrada en el dashboard.
7. Se pueden generar resúmenes del historial del paciente.

## 3. Relación entre diagramas
- Los casos de uso definen la interacción del usuario.
- El flujo de proceso muestra la ruta operativa.
- El modelo entidad-relación define la persistencia.
- Los roles y permisos garantizan el control de acceso.
- La secuencia de registro representa la interacción técnica entre capas.

## 4. Valor de los diagramas
Estos artefactos apoyan:
- la comprensión del sistema por parte de usuarios y tomadores de decisión,
- la comunicación técnica con terceros,
- la documentación del alcance y la evolución futura.
