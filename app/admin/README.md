# app/admin/

Panel de administración. Accesible por roles **ADMIN** y **PROFESOR** (con restricciones). El middleware bloquea el acceso a otros roles.

| Sección | Ruta | Admin | Profesor |
|---------|------|-------|----------|
| Dashboard | `/admin/dashboard` | ✅ | ✅ |
| Capacitaciones | `/admin/capacitaciones` | ✅ | ✅ |
| Colaboradores | `/admin/colaboradores` | ✅ | ✅ (solo lectura) |
| Personal | `/admin/personal` | ✅ | ❌ |
| Reportes | `/admin/reportes` | ✅ | ✅ |
| Calendario | `/admin/calendario` | ✅ | ✅ |
