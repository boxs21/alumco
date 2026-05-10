# app/(auth)/

Grupo de rutas de autenticación. No comparte layout con el resto de la app.

| Ruta | Descripción |
|------|-------------|
| `/login` | Formulario de inicio de sesión. Redirige según rol: admin → `/admin/dashboard`, profesor → `/profesor/dashboard`, colaborador → `/portal` |
| `/forgot-password` | Formulario para solicitar restablecimiento de contraseña por correo |
