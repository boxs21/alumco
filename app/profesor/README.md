# app/profesor/

Panel del profesor. Accesible por rol **PROFESOR**. Comparte vistas con `/admin` pero con permisos reducidos: no puede gestionar personal ni ver datos sensibles de otros usuarios.

| Sección | Ruta | Descripción |
|---------|------|-------------|
| Dashboard | `/profesor/dashboard` | Estadísticas generales (igual que admin, solo lectura) |
| Capacitaciones | `/profesor/capacitaciones` | Gestión de capacitaciones propias |
| Calendario | `/profesor/calendario` | Sesiones programadas |
