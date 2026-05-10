# app/api/

Rutas de API REST internas de Next.js. Solo accesibles desde el servidor o con sesión autenticada.

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/admin/create-user` | POST | Crea un nuevo usuario en Supabase Auth y su perfil |
| `/api/admin/users` | GET | Lista todos los usuarios del sistema |
| `/api/admin/areas/[id]` | GET / POST / DELETE | Gestión de áreas de capacitación |
| `/api/admin/colaboradores/[id]` | GET / PATCH | Obtiene y actualiza datos de un colaborador (rol, sede, área, estado) |
| `/api/certificate/[id]` | GET | Genera o retorna el certificado PDF de un colaborador para una capacitación |
