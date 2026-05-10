# app/admin/capacitaciones/

Listado de todas las capacitaciones del sistema. Permite crear, editar, archivar y eliminar capacitaciones.

**Funcionalidades:**
- Filtro por estado: BORRADOR, PUBLICADO, ARCHIVADO
- Filtro por sede y área
- Acceso rápido a edición y asignación
- Botón para crear nueva capacitación

| Subruta | Descripción |
|---------|-------------|
| `/[id]` | Detalle y edición de una capacitación (materiales, quiz, configuración) |
| `/[id]/asignar` | Asignar la capacitación a colaboradores (todos, por sede, área o individual) |
| `/nueva` | Formulario para crear una nueva capacitación |
