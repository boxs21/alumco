# Alumo Redesign — Topbar & Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Alumo redesign to all admin and profesor pages — matching the design from the handoff HTML prototype — with beige background, updated Topbar (subtitle + search + bell + settings + action slot), and updated sidebar footer with user info.

**Architecture:** The shared `Topbar` component is extended with `sub` (subtitle) and `right` (action slot) props, a search input, and bell/settings icon buttons. Each page passes page-specific subtitle and action button. The `Sidebar` (both admin and profesor layouts) gains a user-info footer. No database schema changes needed.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase, lucide-react, Plus Jakarta Sans / Fraunces fonts.

---

## File Map

| File | Change |
|------|--------|
| `components/layout/Topbar.tsx` | Add `sub`, `right` props; add search bar, bell & settings icons; remove avatar |
| `app/admin/layout.tsx` | No change (already beige bg) |
| `app/profesor/layout.tsx` | No change (already beige bg) |
| `components/layout/Sidebar.tsx` | Add user name/role fetch; render user avatar + name + role in footer |
| `app/admin/dashboard/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/capacitaciones/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/capacitaciones/nueva/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/capacitaciones/[id]/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/capacitaciones/[id]/asignar/page.tsx` | Add `sub` to `<Topbar>` |
| `app/admin/colaboradores/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/colaboradores/[id]/page.tsx` | Add `sub` to `<Topbar>` |
| `app/admin/calendario/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/reportes/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/admin/personal/page.tsx` | Add `sub` to `<Topbar>` |
| `app/profesor/dashboard/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/profesor/capacitaciones/page.tsx` | Add `sub` + `right` to `<Topbar>` |
| `app/profesor/capacitaciones/nueva/page.tsx` | Add `sub` to `<Topbar>` |
| `app/profesor/capacitaciones/[id]/page.tsx` | Add `sub` to `<Topbar>` |
| `app/profesor/capacitaciones/[id]/asignar/page.tsx` | Add `sub` to `<Topbar>` |

---

## Task 1: Update Topbar component

**Files:**
- Modify: `components/layout/Topbar.tsx`

The design's Topbar (`ui.jsx` line 93–111) has:
- Left: large title (`h1`) + optional subtitle (`p`)  
- Right: search input (rounded-full, white bg, 260px min-width) + bell icon button with notification dot + settings icon button + optional `right` action slot

The current Topbar is sticky with `h-14 lg:h-16`, shows user avatar/name on right. Replace the right section with the design pattern; remove the avatar (it moves to Sidebar footer in Task 2).

- [ ] **Step 1: Rewrite `components/layout/Topbar.tsx`**

Replace the entire file with:

```tsx
"use client";

import { Bell, Settings, Search } from "lucide-react";
import type { ReactNode } from "react";

interface TopbarProps {
  title?: ReactNode;
  sub?: string;
  right?: ReactNode;
}

export default function Topbar({ title, sub, right }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-end justify-between border-b border-[#e8e4dc] bg-[#f6f3ee]/95 backdrop-blur-sm px-6 py-5 gap-4 flex-wrap">
      <div>
        {title && (
          <h1 className="text-[26px] font-[800] leading-none tracking-[-0.025em] text-[#15182b]">
            {title}
          </h1>
        )}
        {sub && (
          <p className="mt-1.5 text-[13px] text-[#6b7185]">{sub}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-white border border-[#e8e4dc] px-3 py-[7px] rounded-full min-w-[260px] text-[#a5a9b8]">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            className="flex-1 bg-transparent border-0 outline-none text-[12.5px] text-[#15182b] placeholder:text-[#a5a9b8]"
            placeholder="Buscar capacitaciones, personas…"
          />
        </div>

        {/* Bell */}
        <button
          className="relative w-9 h-9 bg-white border border-[#e8e4dc] text-[#6b7185] rounded-[10px] grid place-items-center hover:bg-[#f7f5f0] hover:text-[#15182b] transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[#ff7c6b] rounded-full border-2 border-white" />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 bg-white border border-[#e8e4dc] text-[#6b7185] rounded-[10px] grid place-items-center hover:bg-[#f7f5f0] hover:text-[#15182b] transition-colors"
          aria-label="Configuración"
        >
          <Settings className="h-4 w-4" />
        </button>

        {right}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors (or only pre-existing errors unrelated to Topbar).

- [ ] **Step 3: Commit**

```bash
cd /Users/boxs/dev/alumco
git add components/layout/Topbar.tsx
git commit -m "feat: update Topbar with subtitle, search, bell/settings, right slot"
```

---

## Task 2: Update Sidebar with user info footer

**Files:**
- Modify: `components/layout/Sidebar.tsx`

The design's sidebar (`ui.jsx` line 66–74) shows at the bottom:
```
[avatar] María Castillo
         Admin · Concepción
```

Currently the sidebar footer only has FontSizeSwitcher + DarkModeToggle + logout. Add user name/email fetch and render a user info row above the existing controls.

- [ ] **Step 1: Update `components/layout/Sidebar.tsx`** — add user info to footer

Find the existing `useEffect` that fetches the user's role and extend it to also fetch name/email. Add a user info display above the logout button.

Replace the file's existing `useEffect` block and the footer section. Here is the complete updated file:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  LogOut,
  UserCog,
} from "lucide-react";
import DarkModeToggle from "@/components/shared/DarkModeToggle";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const allNavItems = [
  { label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard, group: "general", adminOnly: false },
  { label: "Capacitaciones",  href: "/admin/capacitaciones",  icon: BookOpen,         group: "general", adminOnly: false },
  { label: "Colaboradores",   href: "/admin/colaboradores",   icon: Users,            group: "general", adminOnly: false },
  { label: "Reportes",        href: "/admin/reportes",        icon: BarChart3,        group: "general", adminOnly: false },
  { label: "Calendario",      href: "/admin/calendario",      icon: Calendar,         group: "general", adminOnly: false },
  { label: "Personal",        href: "/admin/personal",        icon: UserCog,          group: "equipo",  adminOnly: true },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("Administrador");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name ?? user.email ?? "Usuario";
      setUserName(name);
      supabase.from("profiles").select("role, sede_id").eq("id", user.id).single().then(({ data }) => {
        if (!data) return;
        setIsAdmin(data.role === "ADMIN");
        setUserRole(data.role === "ADMIN" ? "Administrador" : "Profesor");
      });
    });
  }, []);

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);
  const generalItems = navItems.filter((i) => i.group === "general");
  const equipoItems = navItems.filter((i) => i.group === "equipo");
  const initials = userName ? getInitials(userName) : "--";
  const displayName = userName.split(" ").slice(0, 2).join(" ");

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Sidebar] sign-out error:", error.message);
      setSigningOut(false);
      return;
    }
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden lg:flex h-full w-64 flex-col border-r border-[#e8e4dc] bg-white">
      {/* Brand */}
      <div className="flex h-[64px] items-center px-5 border-b border-[#f0ece4]">
        <Image src="/logo.png" alt="ALUMCO" width={130} height={40} className="object-contain" priority />
      </div>

      {/* Navigation */}
      <nav aria-label="Navegación principal" className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2.5 pb-2 text-[10px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8]">
          General
        </p>
        <div className="space-y-0.5">
          {generalItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] transition-all duration-150 ${
                  isActive
                    ? "bg-[#2d4a8a] text-white font-[600] shadow-sm sidebar-active-indicator"
                    : "text-[#6b7185] hover:bg-[#f7f5f0] hover:text-[#15182b]"
                }`}
              >
                <item.icon
                  className={`h-[17px] w-[17px] flex-shrink-0 ${
                    isActive ? "text-[#a5c0f5]" : "text-[#a5a9b8]"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {equipoItems.length > 0 && (
          <>
            <p className="mt-4 px-2.5 pb-2 text-[10px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8]">
              Equipo
            </p>
            <div className="space-y-0.5">
              {equipoItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] transition-all duration-150 ${
                      isActive
                        ? "bg-[#2d4a8a] text-white font-[600] shadow-sm sidebar-active-indicator"
                        : "text-[#6b7185] hover:bg-[#f7f5f0] hover:text-[#15182b]"
                    }`}
                  >
                    <item.icon
                      className={`h-[17px] w-[17px] flex-shrink-0 ${
                        isActive ? "text-[#a5c0f5]" : "text-[#a5a9b8]"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="h-px bg-[#f0ece4] mb-3" />

        {/* User info */}
        {userName && (
          <div className="flex items-center gap-2.5 px-2 py-2.5 mb-1">
            <div className="w-9 h-9 rounded-[12px] bg-[#ff7c6b] text-white grid place-items-center text-[12px] font-[700] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-[700] text-[#15182b] truncate">{displayName}</div>
              <div className="text-[10.5px] text-[#6b7185]">{userRole}</div>
            </div>
          </div>
        )}

        <FontSizeSwitcher />
        <div className="mt-1.5" />
        <DarkModeToggle />
        <div className="mt-1" />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] text-[#a5a9b8] hover:bg-[#f7f5f0] hover:text-[#6b7185] transition-all duration-150 disabled:opacity-50"
        >
          <LogOut className="h-[17px] w-[17px] flex-shrink-0" />
          {signingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/boxs/dev/alumco
git add components/layout/Sidebar.tsx
git commit -m "feat: add user info footer to admin Sidebar"
```

---

## Task 3: Update admin/dashboard/page.tsx

**Files:**
- Modify: `app/admin/dashboard/page.tsx`

Design reference (`screens-admin.jsx` line 12–13):
```jsx
<Topbar title={<>Hola, María <em>·</em></>}
  sub="Esto es lo que está pasando en ALUMCO hoy."
  right={<button className="btn btn-coral btn-sm">+ Nueva capacitación</button>} />
```

- [ ] **Step 1: Update the `<Topbar>` call in `DashboardPage`**

Find line 151 in `app/admin/dashboard/page.tsx`:
```tsx
      <Topbar title="Dashboard" />
```

Replace with (the title uses the user's first name if available, falls back to "Dashboard"):
```tsx
      <Topbar
        title="Dashboard"
        sub="Esto es lo que está pasando en ALUMCO hoy."
        right={
          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Nueva capacitación
          </Link>
        }
      />
```

Make sure `Link` is imported (it already is: `import Link from "next/link"`).

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/boxs/dev/alumco
git add app/admin/dashboard/page.tsx
git commit -m "feat: add subtitle and action to admin dashboard Topbar"
```

---

## Task 4: Update admin/capacitaciones/page.tsx

**Files:**
- Modify: `app/admin/capacitaciones/page.tsx`

Design reference (`screens-admin.jsx` line 160–162):
```jsx
<Topbar title="Capacitaciones" sub="Gestiona los cursos, módulos y asignaciones por sede."
  right={<button className="btn btn-coral btn-sm">+ Nueva capacitación</button>} />
```

- [ ] **Step 1: Update the `<Topbar>` call at line 131**

Find:
```tsx
      <Topbar title="Capacitaciones" />
```

Replace with:
```tsx
      <Topbar
        title="Capacitaciones"
        sub="Gestiona los cursos, módulos y asignaciones por sede."
        right={
          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Nueva capacitación
          </Link>
        }
      />
```

Make sure `Link` is imported (already imported via `import Link from "next/link"`).

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/boxs/dev/alumco
git add app/admin/capacitaciones/page.tsx
git commit -m "feat: add subtitle and action to admin capacitaciones Topbar"
```

---

## Task 5: Update admin/capacitaciones/nueva/page.tsx

**Files:**
- Modify: `app/admin/capacitaciones/nueva/page.tsx`

- [ ] **Step 1: Update the `<Topbar>` call**

Find (line 234):
```tsx
      <Topbar title="Nueva capacitación" />
```

Replace with:
```tsx
      <Topbar
        title="Nueva capacitación"
        sub="Completa los datos para crear y publicar una nueva capacitación."
      />
```

- [ ] **Step 2: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/admin/capacitaciones/nueva/page.tsx
git commit -m "feat: add subtitle to nueva capacitación Topbar"
```

---

## Task 6: Update admin/capacitaciones/[id]/page.tsx

**Files:**
- Modify: `app/admin/capacitaciones/[id]/page.tsx`

There are 3 `<Topbar>` calls in this file (loading state, error state, and main render at lines 130, 139, 161).

- [ ] **Step 1: Read the file to see the full Topbar context**

```bash
grep -n "Topbar\|training\." /Users/boxs/dev/alumco/app/admin/capacitaciones/\[id\]/page.tsx | head -30
```

- [ ] **Step 2: Update all three Topbar calls**

Loading state (around line 130) — change:
```tsx
        <Topbar title="" />
```
To:
```tsx
        <Topbar title="Capacitación" sub="Cargando…" />
```

Error state (around line 139) — change:
```tsx
        <Topbar title="" />
```
To:
```tsx
        <Topbar title="Capacitación" sub="No se pudo cargar." />
```

Main render (around line 161) — change:
```tsx
        <Topbar title="" />
```
To (using the training title from state):
```tsx
        <Topbar
          title={training.title}
          sub={`${training.target_area} · ${training.status === "PUBLISHED" ? "Publicado" : training.status === "DRAFT" ? "Borrador" : "Archivado"}`}
          right={
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-[#e8e4dc] text-[#15182b] text-[13px] font-[600] hover:bg-[#f7f5f0] transition-colors">
                Guardar borrador
              </button>
              <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors">
                Publicar cambios
              </button>
            </div>
          }
        />
```

Note: The variable name for the training object depends on what the page uses (likely `training`). Check and match accordingly.

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add "app/admin/capacitaciones/[id]/page.tsx"
git commit -m "feat: add dynamic subtitle and actions to capacitacion detail Topbar"
```

---

## Task 7: Update admin/capacitaciones/[id]/asignar/page.tsx

**Files:**
- Modify: `app/admin/capacitaciones/[id]/asignar/page.tsx`

- [ ] **Step 1: Read the file to understand state variable names**

```bash
grep -n "Topbar\|trainingTitle\|title" /Users/boxs/dev/alumco/app/admin/capacitaciones/\[id\]/asignar/page.tsx | head -20
```

- [ ] **Step 2: Update all Topbar calls**

Loading (line ~154):
```tsx
        <Topbar title="Asignar" sub="Cargando…" />
```

Main render (line ~162) — replace:
```tsx
      <Topbar title={`Asignar: ${trainingTitle}`} />
```
With (using whatever variable holds the training title, verify from Step 1):
```tsx
      <Topbar
        title={`Asignar colaboradores`}
        sub={trainingTitle}
      />
```

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add "app/admin/capacitaciones/[id]/asignar/page.tsx"
git commit -m "feat: add subtitle to asignar capacitacion Topbar"
```

---

## Task 8: Update admin/colaboradores/page.tsx

**Files:**
- Modify: `app/admin/colaboradores/page.tsx`

Design reference (`screens-admin.jsx` line 357–359):
```jsx
<Topbar title="Colaboradores" sub="148 personas activas · 31 áreas · 2 sedes"
  right={<button className="btn btn-coral btn-sm">+ Invitar colaborador</button>} />
```

- [ ] **Step 1: Read the file to find what state variables hold the profile count**

```bash
grep -n "profiles\|count\|Topbar" /Users/boxs/dev/alumco/app/admin/colaboradores/page.tsx | head -20
```

- [ ] **Step 2: Update the `<Topbar>` call at line 114**

Replace:
```tsx
      <Topbar title="Colaboradores" />
```

With (use actual `profiles` array length from state, which is already in scope):
```tsx
      <Topbar
        title="Colaboradores"
        sub={`${profiles.length} personas · 2 sedes`}
        right={
          <Link
            href="/admin/personal"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Invitar colaborador
          </Link>
        }
      />
```

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/admin/colaboradores/page.tsx
git commit -m "feat: add subtitle and action to colaboradores Topbar"
```

---

## Task 9: Update admin/colaboradores/[id]/page.tsx

**Files:**
- Modify: `app/admin/colaboradores/[id]/page.tsx`

- [ ] **Step 1: Read the file to understand state variables**

```bash
grep -n "Topbar\|profile\|name" /Users/boxs/dev/alumco/app/admin/colaboradores/\[id\]/page.tsx | head -20
```

- [ ] **Step 2: Update all three Topbar calls**

Loading state:
```tsx
        <Topbar title="Colaborador" sub="Cargando…" />
```

Error state:
```tsx
        <Topbar title="Colaborador" sub="No se pudo cargar." />
```

Main render (use whatever variable holds the profile name — likely `profile.name`):
```tsx
        <Topbar
          title={profile.name ?? "Colaborador"}
          sub={`${profile.area ?? ""} · ${profile.active ? "Activo" : "Inactivo"}`}
        />
```

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add "app/admin/colaboradores/[id]/page.tsx"
git commit -m "feat: add dynamic subtitle to colaborador detail Topbar"
```

---

## Task 10: Update admin/calendario/page.tsx

**Files:**
- Modify: `app/admin/calendario/page.tsx`

Design reference (`screens-admin.jsx` line 439–441):
```jsx
<Topbar title="Calendario" sub="Mayo 2026 · 14 sesiones programadas"
  right={<button className="btn btn-coral btn-sm">+ Nueva sesión</button>} />
```

- [ ] **Step 1: Read line range 335–345 to understand current state**

```bash
sed -n '335,355p' /Users/boxs/dev/alumco/app/admin/calendario/page.tsx
```

- [ ] **Step 2: Update the `<Topbar>` call at line 339**

Replace:
```tsx
      <Topbar title="Calendario" />
```

With:
```tsx
      <Topbar
        title="Calendario"
        sub="Sesiones y eventos programados"
        right={
          <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors">
            <span className="text-lg leading-none">+</span> Nueva sesión
          </button>
        }
      />
```

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/admin/calendario/page.tsx
git commit -m "feat: add subtitle and action to calendario Topbar"
```

---

## Task 11: Update admin/reportes/page.tsx

**Files:**
- Modify: `app/admin/reportes/page.tsx`

Design reference (`screens-admin.jsx` line 521–523):
```jsx
<Topbar title="Reportes" sub="Indicadores de cumplimiento, certificación y evolución"
  right={<><button>Período: 2026</button><button>Exportar PDF</button></>} />
```

- [ ] **Step 1: Update the `<Topbar>` call at line 154**

Replace:
```tsx
      <Topbar title="Reportes" />
```

With:
```tsx
      <Topbar
        title="Reportes"
        sub="Indicadores de cumplimiento, certificación y evolución"
        right={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-[#e8e4dc] text-[#15182b] text-[13px] font-[600] hover:bg-[#f7f5f0] transition-colors">
              Período: 2026
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors">
              Exportar PDF
            </button>
          </div>
        }
      />
```

- [ ] **Step 2: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/admin/reportes/page.tsx
git commit -m "feat: add subtitle and export action to reportes Topbar"
```

---

## Task 12: Update admin/personal/page.tsx

**Files:**
- Modify: `app/admin/personal/page.tsx`

- [ ] **Step 1: Update the `<Topbar>` call at line 196**

Replace:
```tsx
      <Topbar title="Personal" />
```

With:
```tsx
      <Topbar
        title="Personal"
        sub="Gestiona los accesos y cuentas del equipo."
      />
```

- [ ] **Step 2: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/admin/personal/page.tsx
git commit -m "feat: add subtitle to personal Topbar"
```

---

## Task 13: Update profesor/layout.tsx Sidebar with user info

**Files:**
- Modify: `app/profesor/layout.tsx`

The profesor layout has an inline `Sidebar` function. Apply the same user-info footer pattern as Task 2.

- [ ] **Step 1: Read the current footer section of the profesor Sidebar**

```bash
sed -n '60,80p' /Users/boxs/dev/alumco/app/profesor/layout.tsx
```

- [ ] **Step 2: Update the Sidebar in `app/profesor/layout.tsx`**

Add user name/initials state, fetch on mount, and render user info block in the footer above FontSizeSwitcher.

Find the `function Sidebar()` block. Add these state variables and useEffect after the existing `useState` calls:

```tsx
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name ?? user.email ?? "";
      setUserName(name);
    });
  }, []);

  const initials = userName ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "--";
  const displayName = userName.split(" ").slice(0, 2).join(" ");
```

Then in the footer `<div className="relative px-3 pb-5">`, add the user block before `<FontSizeSwitcher />`:

```tsx
        {userName && (
          <div className="flex items-center gap-2.5 px-2 py-2.5 mb-1">
            <div className="w-9 h-9 rounded-[12px] bg-[#ff7c6b] text-white grid place-items-center text-[12px] font-[700] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-[700] text-[#15182b] truncate">{displayName}</div>
              <div className="text-[10.5px] text-[#6b7185]">Profesor</div>
            </div>
          </div>
        )}
```

Make sure `createClient` is already imported (it is: `import { createClient } from "@/lib/supabase"`).

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/profesor/layout.tsx
git commit -m "feat: add user info footer to profesor Sidebar"
```

---

## Task 14: Update profesor/dashboard/page.tsx

**Files:**
- Modify: `app/profesor/dashboard/page.tsx`

- [ ] **Step 1: Update the `<Topbar>` call at line 97**

Replace:
```tsx
      <Topbar title="Dashboard" />
```

With:
```tsx
      <Topbar
        title="Dashboard"
        sub="Esto es lo que está pasando hoy."
        right={
          <Link
            href="/profesor/capacitaciones/nueva"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Nueva capacitación
          </Link>
        }
      />
```

Make sure `Link` is imported: `import Link from "next/link"`.

- [ ] **Step 2: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/profesor/dashboard/page.tsx
git commit -m "feat: add subtitle and action to profesor dashboard Topbar"
```

---

## Task 15: Update profesor/capacitaciones/page.tsx

**Files:**
- Modify: `app/profesor/capacitaciones/page.tsx`

- [ ] **Step 1: Update the `<Topbar>` call at line 80**

Replace:
```tsx
      <Topbar title="Capacitaciones" />
```

With:
```tsx
      <Topbar
        title="Capacitaciones"
        sub="Gestiona los cursos, módulos y asignaciones por sede."
        right={
          <Link
            href="/profesor/capacitaciones/nueva"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-lg leading-none">+</span> Nueva capacitación
          </Link>
        }
      />
```

- [ ] **Step 2: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add app/profesor/capacitaciones/page.tsx
git commit -m "feat: add subtitle and action to profesor capacitaciones Topbar"
```

---

## Task 16: Update profesor remaining pages

**Files:**
- Modify: `app/profesor/capacitaciones/nueva/page.tsx`
- Modify: `app/profesor/capacitaciones/[id]/page.tsx`
- Modify: `app/profesor/capacitaciones/[id]/asignar/page.tsx`

- [ ] **Step 1: Update `profesor/capacitaciones/nueva/page.tsx`** (line 140)

Replace:
```tsx
      <Topbar title="Nueva capacitación" />
```
With:
```tsx
      <Topbar
        title="Nueva capacitación"
        sub="Completa los datos para crear y publicar una nueva capacitación."
      />
```

- [ ] **Step 2: Update `profesor/capacitaciones/[id]/page.tsx`**

Read the file first:
```bash
grep -n "Topbar\|training\." /Users/boxs/dev/alumco/app/profesor/capacitaciones/\[id\]/page.tsx | head -20
```

Apply the same pattern as Task 6 (admin version):
- Loading: `<Topbar title="Capacitación" sub="Cargando…" />`
- Error: `<Topbar title="Capacitación" sub="No se pudo cargar." />`
- Main: `<Topbar title={training.title} sub={training.target_area} />`

- [ ] **Step 3: Update `profesor/capacitaciones/[id]/asignar/page.tsx`**

Read the file first:
```bash
grep -n "Topbar\|trainingTitle" /Users/boxs/dev/alumco/app/profesor/capacitaciones/\[id\]/asignar/page.tsx | head -20
```

Apply same pattern as Task 7:
- Loading: `<Topbar title="Asignar" sub="Cargando…" />`
- Main: `<Topbar title="Asignar colaboradores" sub={trainingTitle} />`

- [ ] **Step 4: TypeScript check + commit**

```bash
cd /Users/boxs/dev/alumco && npx tsc --noEmit 2>&1 | head -20
git add "app/profesor/capacitaciones/nueva/page.tsx" "app/profesor/capacitaciones/[id]/page.tsx" "app/profesor/capacitaciones/[id]/asignar/page.tsx"
git commit -m "feat: add subtitles to profesor capacitacion detail/nueva/asignar Topbars"
```

---

## Self-Review

**Spec coverage:**
- ✅ Topbar updated with subtitle, search, bell, settings, right slot (Task 1)
- ✅ Sidebar user info footer: admin Sidebar (Task 2) + profesor layout Sidebar (Task 13)
- ✅ All 6 admin pages: dashboard (T3), capacitaciones (T4), nueva (T5), detail (T6), asignar (T7), colaboradores (T8), colaborador detail (T9), calendario (T10), reportes (T11), personal (T12)
- ✅ All profesor pages: dashboard (T14), capacitaciones (T15), nueva/detail/asignar (T16)
- ✅ Beige background already set in both layouts — no change needed

**Placeholder scan:** No TBD/TODO present.

**Type consistency:** `TopbarProps` defines `title?: ReactNode`, `sub?: string`, `right?: ReactNode`. All tasks pass string titles and string subs — consistent.
