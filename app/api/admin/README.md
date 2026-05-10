# app/api/admin/

Rutas de API para operaciones administrativas. Requieren sesión con rol ADMIN o PROFESOR según el endpoint.

| Subruta | Descripción |
|---------|-------------|
| `areas/[id]` | CRUD de áreas de capacitación |
| `colaboradores/[id]` | Lectura y actualización de perfil de colaborador |
| `create-user` | Creación de nuevo usuario |
| `users` | Listado de usuarios |
