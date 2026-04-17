# Portal — Dashboard Personal del Colaborador

**Fecha:** 2026-04-16
**Objetivo:** Reemplazar la lista plana como página de inicio del portal por un dashboard personal que muestre progreso, urgencias y actividad histórica, aumentando el engagement y tasa de completado.

---

## Contexto

ALUMCO es una plataforma de capacitación interna para una ONG chilena con dos sedes (Concepción y Coyhaique). El portal del colaborador actualmente muestra solo una lista de capacitaciones asignadas. El problema principal es baja motivación — la interfaz no comunica progreso personal ni urgencias de forma efectiva.

---

## Cambios de rutas

| Antes | Después |
|-------|---------|
| `/portal` → lista de capacitaciones | `/portal` → dashboard personal (NUEVO) |
| — | `/portal/capacitaciones` → lista de capacitaciones (MOVIDA) |
| `/portal/historial` | sin cambios |
| `/portal/capacitacion/[id]` | sin cambios |

La navegación superior pasa de 2 pestañas a 3:
`[ Inicio ]  [ Mis capacitaciones ]  [ Historial ]`

---

## Componentes del Dashboard (`/portal`)

### 1. Tarjeta de saludo + progreso global

- Saludo con nombre del usuario (de `profiles.name`)
- Sede y área (de `profiles.sede_id`, `profiles.area`)
- Barra de progreso horizontal con conteo: "X de Y completadas — Z%"
- Datos: `profiles` + `assignments` filtradas por `user_id`

### 2. Capacitaciones urgentes

- Máximo 3 tarjetas horizontales
- Solo assignments con `status = 'IN_PROGRESS'` y `due_date` no nulo
- Ordenadas por `due_date` ascendente (más próxima primero)
- Indicador de urgencia:
  - Rojo: vence en menos de 3 días
  - Amarillo: vence en menos de 7 días
  - Verde (sin tarjeta): si todas están al día, mensaje de éxito
- Cada tarjeta tiene link directo a `/portal/capacitacion/[training_id]`

### 3. Calendario de actividad (últimos 90 días)

- Grilla de cuadraditos por semana (estilo GitHub contributions)
- Cada celda representa 1 semana; se colorea si el usuario completó al menos 1 capacitación esa semana
- Tooltip al hover con nombre de la(s) capacitación(es) completadas
- Data: `certificates.issued_at` filtrado por `user_id`, últimos 90 días
- Si no hay actividad: estado vacío con mensaje motivacional

### 4. Progreso por área personal

- Barras horizontales por área
- Solo áreas donde el usuario tiene assignments
- Lógica: assignments completadas / total por `target_area` del training
- Misma data que ya carga el dashboard, filtrada por `user_id`

---

## Estrategia de datos

Un único `useEffect` con `Promise.all` (patrón existente en la app):

```ts
const [profileRes, assignmentsRes, certificatesRes] = await Promise.all([
  supabase.from("profiles").select("name, sede_id, area").eq("id", user.id).single(),
  supabase.from("assignments")
    .select("id, status, due_date, training_id, trainings(id, title, target_area)")
    .or(conditions.join(",")),
  supabase.from("certificates")
    .select("issued_at, training_id")
    .eq("user_id", user.id),
])
```

**Sin tablas nuevas. Sin Edge Functions. Sin API routes.**

---

## Cambios en navegación (`/portal/layout.tsx`)

- Agregar pestaña "Inicio" apuntando a `/portal`
- Renombrar "Mis capacitaciones" apuntando a `/portal/capacitaciones`
- Mantener "Historial" apuntando a `/portal/historial`
- Aplicar igual en nav mobile (bottom bar)

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `app/portal/page.tsx` | Reemplazar completamente por dashboard |
| `app/portal/capacitaciones/page.tsx` | Nuevo archivo — copia de la lista actual |
| `app/portal/layout.tsx` | Actualizar nav (3 pestañas) |
| `components/shared/ActivityCalendar.tsx` | Nuevo componente — grilla de actividad |

---

## Diseño visual

Sigue los tokens existentes del portal:
- Navy: `#181d26`
- Blue: `#1b61c9`
- Blue light: `#eff6ff`
- Border: `#e0e2e6`
- Surface: `#f8fafc`
- Success: `#15803d` / `#f0fdf4`
- Warning: `#d97706` / `#fff8ed`
- Danger: `#dc2626` / `#fef2f2`

Bordes redondeados: `rounded-2xl` (patrón existente)
Sombras: `rgba(15,48,106,0.05) 0px 0px 20px` (patrón existente)

---

## Criterios de éxito

- El colaborador ve su progreso global al abrir el portal (sin hacer scroll)
- Las capacitaciones urgentes son visibles en menos de 2 segundos de carga
- El calendario motiva revisitar — el usuario puede ver su historial de actividad
- No se rompe ninguna ruta existente (historial, capacitacion/[id])
