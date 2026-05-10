# app/admin/colaboradores/

Directorio de colaboradores de la organización. Muestra todos los usuarios con rol COLLABORATOR.

**Funcionalidades:**
- Filtro por sede (Todas / Concepción / Coyhaique)
- Barra de progreso de capacitaciones completadas por usuario
- Botón **Editar** (solo visible para ADMIN): permite cambiar rol, sede, área y estado activo/inactivo
- Botón **Ver perfil**: accede al detalle individual del colaborador

| Subruta | Descripción |
|---------|-------------|
| `/[id]` | Perfil detallado del colaborador con historial de capacitaciones y certificados |
