# DATABASE.md — Estructura de Base de Datos ALUMCO

> Proyecto: Plataforma Web de Capacitación Interna — ONG ALUMCO  
> Stack: Supabase (PostgreSQL) + Next.js 14  
> Última actualización: 2026-04-16  
> Proyecto Supabase: sjaufigbsiafyzyaaomq

---

## Tablas (11 en total)

### sedes
Almacena las dos residencias de la ONG.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| nombre | text | NO | — | Nombre legible |
| slug | text | NO | — | UNIQUE. Valores: CONCEPCION, COYHAIQUE |
| direccion | text | SÍ | — | Dirección física |
| created_at | timestamptz | SÍ | now() | — |

**Registros fijos:** Concepción y Coyhaique (no se agregan más).

---

### profiles
Extiende auth.users de Supabase. Un perfil por usuario.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | — | PK, FK → auth.users.id |
| name | text | SÍ | — | Nombre completo |
| email | text | SÍ | — | UNIQUE |
| role | text | NO | COLLABORATOR | Valores: ADMIN, COLLABORATOR |
| area | text | SÍ | — | Ej: Cuidado, Enfermería, Administración |
| sede_id | uuid | SÍ | — | FK → sedes.id |
| active | boolean | SÍ | true | False = usuario desactivado |
| created_at | timestamptz | SÍ | now() | — |

**Trigger:** on_auth_user_created — crea profile automáticamente al registrar usuario en Auth.  
**RLS:** cada usuario solo lee su propio perfil. Admin lee todos.

---

### trainings
Capacitaciones creadas por el administrador.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| title | text | NO | — | — |
| description | text | SÍ | — | — |
| target_area | text | SÍ | — | Área objetivo |
| status | text | NO | DRAFT | Valores: DRAFT, PUBLISHED, ARCHIVED |
| sede_id | uuid | SÍ | — | FK → sedes.id. NULL = global (ambas sedes) |
| created_by | uuid | SÍ | — | FK → profiles.id |
| created_at | timestamptz | SÍ | now() | — |

**Regla:** sede_id NULL significa que la capacitación aplica a ambas sedes.

---

### files
Material multimedia asociado a una capacitación.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| training_id | uuid | NO | — | FK → trainings.id (cascade delete) |
| name | text | NO | — | Nombre del archivo |
| type | text | NO | — | Valores: PDF, VIDEO, PRESENTATION, IMAGE |
| url | text | NO | — | Link YouTube, Google Drive o URL directa |
| order | int | SÍ | 0 | Orden de visualización |
| created_at | timestamptz | SÍ | now() | — |

**Nota:** Los videos se embed directamente (YouTube iframe o Drive preview).

---

### quizzes
Evaluación asociada a una capacitación (máximo 1 por capacitación).

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| training_id | uuid | NO | — | FK → trainings.id. UNIQUE (1 quiz por capacitación) |
| passing_score | float | NO | 60 | Porcentaje mínimo para aprobar |
| max_attempts | int | NO | 3 | Intentos máximos permitidos |
| created_at | timestamptz | SÍ | now() | — |

---

### questions
Preguntas del quiz.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| quiz_id | uuid | NO | — | FK → quizzes.id (cascade delete) |
| text | text | NO | — | Texto de la pregunta |
| points | float | SÍ | 1 | Peso de la pregunta |
| order | int | SÍ | 0 | Orden de visualización |

---

### options
Alternativas de respuesta para cada pregunta.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| question_id | uuid | NO | — | FK → questions.id (cascade delete) |
| text | text | NO | — | Texto de la alternativa |
| is_correct | boolean | SÍ | false | Solo una opción correcta por pregunta |

---

### assignments
Asignaciones de capacitaciones a usuarios o grupos.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| training_id | uuid | NO | — | FK → trainings.id |
| user_id | uuid | SÍ | — | FK → profiles.id. NULL si es asignación grupal |
| target_type | text | NO | — | Valores: ALL, SEDE, AREA, INDIVIDUAL |
| target_sede_id | uuid | SÍ | — | FK → sedes.id. Solo si target_type = SEDE |
| target_area | text | SÍ | — | Solo si target_type = AREA |
| due_date | timestamptz | SÍ | — | Fecha límite opcional |
| status | text | NO | PENDING | Valores: PENDING, IN_PROGRESS, COMPLETED |
| created_at | timestamptz | SÍ | now() | — |

**Lógica de asignación:**
- ALL → todos los colaboradores activos
- SEDE → todos los de target_sede_id
- AREA → todos los de target_area
- INDIVIDUAL → user_id específico

---

### attempts
Intentos de evaluación de un colaborador.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | — | FK → profiles.id |
| quiz_id | uuid | NO | — | FK → quizzes.id |
| score | float | SÍ | — | Porcentaje obtenido (0-100) |
| passed | boolean | SÍ | — | true si score >= passing_score |
| attempt_number | int | SÍ | 1 | Número de intento (1, 2, 3...) |
| started_at | timestamptz | SÍ | now() | — |
| finished_at | timestamptz | SÍ | — | NULL si no terminó |

---

### certificates
Certificados emitidos al aprobar una capacitación.

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | — | FK → profiles.id |
| training_id | uuid | NO | — | FK → trainings.id |
| attempt_id | uuid | SÍ | — | FK → attempts.id. UNIQUE. NULL si no tiene quiz |
| verification_code | text | SÍ | gen_random_uuid()::text | UNIQUE. Para verificar autenticidad |
| pdf_url | text | SÍ | — | URL del PDF generado (pendiente implementar) |
| issued_at | timestamptz | SÍ | now() | — |

---

### sessions
Sesiones presenciales u online asociadas a una capacitación. **Tabla creada pero pendiente de integrar al frontend.**

| Columna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| training_id | uuid | NO | — | FK → trainings.id |
| sede_id | uuid | SÍ | — | FK → sedes.id |
| start_date | date | NO | — | Fecha inicio |
| end_date | date | NO | — | Fecha fin |
| modality | text | NO | PRESENCIAL | Valores: PRESENCIAL, ONLINE |
| notes | text | SÍ | — | Observaciones |
| created_at | timestamptz | NO | now() | — |

---

## Relaciones clave

```
auth.users ──── profiles (1:1)
profiles ──── assignments (1:N por user_id)
profiles ──── attempts (1:N)
profiles ──── certificates (1:N)
sedes ──── profiles (1:N)
sedes ──── trainings (1:N, nullable = global)
trainings ──── files (1:N)
trainings ──── quizzes (1:1)
trainings ──── assignments (1:N)
trainings ──── sessions (1:N)
quizzes ──── questions (1:N)
questions ──── options (1:N)
attempts ──── certificates (1:1, nullable)
```

---

## RLS (Row Level Security)

Todas las tablas tienen RLS habilitado.

| Tabla | Política |
|---|---|
| profiles | SELECT: solo propio perfil. Admin: todos |
| trainings | SELECT: publicadas o si es admin |
| assignments | SELECT: propio user_id o admin |
| attempts | SELECT/INSERT/UPDATE: propio user_id |
| certificates | SELECT/INSERT: propio user_id |
| sedes | SELECT: todos |

---

## Estado de integración frontend

| Tabla | Estado |
|---|---|
| sedes | Integrada |
| profiles | Integrada |
| trainings | Integrada |
| files | Integrada |
| quizzes | Integrada |
| questions | Integrada |
| options | Integrada |
| assignments | Integrada |
| attempts | Integrada |
| certificates | Integrada (sin PDF) |
| sessions | Integrada (portal: solo lectura) |

---

## Pendientes técnicos

- [ ] Generación de PDF del certificado (pdf_url sigue NULL)
- [ ] Panel de gestión de personal (crear/desactivar colaboradores)
- [ ] Export Excel real en reportes
- [ ] Notificaciones email al asignar capacitación
