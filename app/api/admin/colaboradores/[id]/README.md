# app/api/admin/colaboradores/[id]/

API para gestión de perfil de colaborador.

- `GET` — Retorna datos del perfil (nombre, email, rol, sede, área, estado)
- `PATCH` — Actualiza rol, sede_id, area y/o active del colaborador. Solo ADMIN puede cambiar el rol
