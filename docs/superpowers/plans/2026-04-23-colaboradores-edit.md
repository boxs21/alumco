# Colaboradores Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to manage and create new areas dynamically, and edit collaborator profiles (Sede, Estado, Area) directly from the Colaboradores tab.

**Architecture:** We will create REST endpoints for updating a profile and managing areas (CRUD). We'll add two modals to the Colaboradores page: one for managing Areas (list, add, delete) and one for editing a Collaborator. We'll also update the Personal page's Create User form to fetch areas dynamically from the database.

**Tech Stack:** Next.js App Router API Routes, Supabase client/admin client, React useState/useEffect, shadcn/ui Dialog.

---

### Task 1: Create Area Management API

**Files:**
- Create: `app/api/admin/areas/route.ts`
- Create: `app/api/admin/areas/[id]/route.ts`

- [ ] **Step 1: Create the GET/POST Area API**

Create `app/api/admin/areas/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("areas").select("id, name").order("name");
    if (error) throw error;
    return NextResponse.json({ areas: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin.from("areas").insert({ name: name.trim() }).select("id, name").single();
    if (error) throw error;
    return NextResponse.json({ area: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create the DELETE Area API**

Create `app/api/admin/areas/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin.from("areas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Task 2: Create Profile Update API

**Files:**
- Create: `app/api/admin/colaboradores/[id]/route.ts`

- [ ] **Step 1: Create the PATCH API for updating profiles**

Create `app/api/admin/colaboradores/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { area, sede_id, active } = await req.json();
    
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({ area: area || null, sede_id: sede_id || null, active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Task 3: Add Edit Modal to Colaboradores Page

**Files:**
- Modify: `app/admin/colaboradores/page.tsx`

- [ ] **Step 1: Add state and fetch areas in the page**

Modify `app/admin/colaboradores/page.tsx`. Add Area interface and state:

```tsx
// Under interface Sede
interface Area { id: string; name: string; }

// Inside ColaboradoresPage component
  const [areas, setAreas] = useState<Area[]>([]);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [editSede, setEditSede] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // In the load() Promise.all add the areas fetch
  const [
    { data: profilesData, error: profilesError },
    { data: assignmentsData },
    { data: sedesData },
    { data: areasData },
  ] = await Promise.all([
    supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR").order("name"),
    supabase.from("assignments").select("user_id, status"),
    supabase.from("sedes").select("id, nombre").order("nombre"),
    supabase.from("areas").select("id, name").order("name"),
  ]);
  // Add setAreas(areasData ?? []); after setting sedes
```

- [ ] **Step 2: Add the edit save handler**

Inside `ColaboradoresPage`:

```tsx
  async function handleSaveEdit() {
    if (!editProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/colaboradores/${editProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: editArea || null,
          sede_id: editSede || null,
          active: editActive
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      
      // Update local state
      setProfiles(profiles.map(p => p.id === editProfile.id ? { ...p, area: editArea, sede_id: editSede, active: editActive } : p));
      setEditProfile(null);
    } catch (err) {
      alert("Error al actualizar colaborador");
    } finally {
      setSaving(false);
    }
  }
```

- [ ] **Step 3: Render the Edit Button and Dialog**

Update the TableCell for "Acción" to have an "Editar" button next to "Ver perfil →":

```tsx
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <button
      onClick={() => {
        setEditProfile(user);
        setEditSede(user.sede_id || "");
        setEditArea(user.area || "");
        setEditActive(user.active);
      }}
      className="inline-flex items-center h-8 px-3 rounded-lg border border-[#e8e4dc] bg-white text-xs font-[600] text-[#6b7185] hover:bg-[#f6f3ee] transition-colors"
    >
      Editar
    </button>
    <Link
      href={`/admin/colaboradores/${user.id}`}
      className="inline-flex items-center h-8 px-3 rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-xs font-[600] text-[#15182b] hover:bg-[#eaf0fb] transition-colors"
    >
      Ver perfil →
    </Link>
  </div>
</TableCell>
```

At the bottom of `app/admin/colaboradores/page.tsx` (before closing `</div>`), add the Edit Dialog:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add to JSX:
      <Dialog open={!!editProfile} onOpenChange={(open) => !open && setEditProfile(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-[#e8e4dc]">
          <DialogHeader>
            <DialogTitle className="text-[#15182b]">Editar Colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#15182b]">Sede</label>
              <Select value={editSede} onValueChange={setEditSede}>
                <SelectTrigger className="h-10 rounded-xl border-[#e8e4dc]">
                  <SelectValue placeholder="Sin sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin sede</SelectItem>
                  {sedes.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#15182b]">Área</label>
              <Select value={editArea} onValueChange={setEditArea}>
                <SelectTrigger className="h-10 rounded-xl border-[#e8e4dc]">
                  <SelectValue placeholder="Sin área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin área</SelectItem>
                  {areas.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#15182b]">Estado</label>
              <Select value={editActive ? "true" : "false"} onValueChange={(v) => setEditActive(v === "true")}>
                <SelectTrigger className="h-10 rounded-xl border-[#e8e4dc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditProfile(null)} className="flex-1 h-10 rounded-xl bg-[#f6f3ee] text-sm text-[#6b7185] hover:bg-[#eaf0fb]">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 h-10 rounded-xl bg-[#2d4a8a] text-white text-sm hover:bg-[#15182b] disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
```

### Task 4: Add Area Management Modal

**Files:**
- Modify: `app/admin/colaboradores/page.tsx`

- [ ] **Step 1: Add Area Management State and Handlers**

Add to `ColaboradoresPage`:

```tsx
  const [showAreasModal, setShowAreasModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);

  async function handleCreateArea() {
    if (!newAreaName.trim()) return;
    setCreatingArea(true);
    try {
      const res = await fetch("/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAreaName }),
      });
      if (!res.ok) throw new Error("Error creating area");
      const { area } = await res.json();
      setAreas([...areas, area].sort((a, b) => a.name.localeCompare(b.name)));
      setNewAreaName("");
    } catch (error) {
      alert("Error al crear área. Verifica que no exista ya.");
    } finally {
      setCreatingArea(false);
    }
  }

  async function handleDeleteArea(id: string) {
    if (!confirm("¿Seguro que deseas eliminar esta área?")) return;
    try {
      const res = await fetch(`/api/admin/areas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAreas(areas.filter(a => a.id !== id));
    } catch (e) {
      alert("Error al eliminar área");
    }
  }
```

- [ ] **Step 2: Add Administrar Áreas button**

In the Topbar `right` prop, change it to render two buttons:

```tsx
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAreasModal(true)}
              className="inline-flex items-center h-9 px-4 rounded-full border border-[#e8e4dc] bg-white hover:bg-[#f6f3ee] text-[#15182b] text-[13px] font-[600] transition-colors"
            >
              Administrar Áreas
            </button>
            <Link
              href="/admin/personal"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
            >
              <span className="text-base leading-none">+</span> Invitar colaborador
            </Link>
          </div>
        }
```

- [ ] **Step 3: Add the Areas Dialog**

Add this before the closing `</div>` of the page:

```tsx
      <Dialog open={showAreasModal} onOpenChange={setShowAreasModal}>
        <DialogContent className="max-w-md rounded-2xl border-[#e8e4dc]">
          <DialogHeader>
            <DialogTitle className="text-[#15182b]">Administrar Áreas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre de la nueva área..."
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-[#e8e4dc] text-sm"
              />
              <button
                onClick={handleCreateArea}
                disabled={creatingArea || !newAreaName.trim()}
                className="h-10 px-4 rounded-xl bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] disabled:opacity-50"
              >
                Añadir
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-[#e8e4dc] rounded-xl p-2 bg-[#fcfbfa]">
              {areas.length === 0 ? (
                <p className="text-sm text-[#a5a9b8] text-center py-4">No hay áreas creadas.</p>
              ) : (
                areas.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#f0ece4] shadow-sm">
                    <span className="text-sm font-medium text-[#15182b]">{a.name}</span>
                    <button 
                      onClick={() => handleDeleteArea(a.id)}
                      className="text-xs text-[#e86154] hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
```

### Task 5: Update `app/admin/personal/page.tsx` to use dynamic areas

**Files:**
- Modify: `app/admin/personal/page.tsx`

- [ ] **Step 1: Fetch areas from DB**

Modify `loadProfiles`:

```tsx
  // Add state: const [areas, setAreas] = useState<{name: string}[]>([]);
  // Change loadProfiles to load areas as well:
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = createClient();
    const [{ data: profilesData, error: profilesError }, { data: areasData }] = await Promise.all([
      supabase.from("profiles").select("id, name, email, role, area, sede_id, active").order("name"),
      supabase.from("areas").select("name").order("name")
    ]);
    if (profilesError) {
      setLoadError("No se pudo cargar el personal.");
      setLoading(false);
      return;
    }
    setProfiles((profilesData ?? []) as Profile[]);
    setAreas((areasData ?? []) as {name: string}[]);
    setLoading(false);
  }, []);
```

- [ ] **Step 2: Remove hardcoded AREAS import and use dynamic list**

Remove `AREAS` from the imports at the top:
`import { SEDES, sedeName } from "@/lib/config";`

In the area `SelectContent`:
```tsx
                  <SelectContent className="rounded-xl">
                    {areas.map((a) => (
                      <SelectItem key={a.name} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
```

*(Note: Other instances of `AREAS` in the project can be migrated in a follow-up plan, but these are the primary admin tabs requested.)*
