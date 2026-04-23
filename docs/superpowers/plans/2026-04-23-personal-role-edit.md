# Personal Page Management & Role Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move "Administrar Áreas" to the Personal tab, add role editing to collaborator profiles, and implement editing directly in the Personal page table.

**Architecture:** We will update the Personal page to include Area management and a new edit modal for any staff member (ADMIN or COLLABORATOR). We'll update the `PATCH` API to support role updates. We'll also clean up the Colaboradores page as requested.

**Tech Stack:** Next.js App Router, Supabase, React, shadcn/ui Dialog/Select.

---

### Task 1: Update Profile PATCH API to support Role

**Files:**
- Modify: `app/api/admin/colaboradores/[id]/route.ts`

- [ ] **Step 1: Update the PATCH API to include role**

```typescript
// Update the destruction in app/api/admin/colaboradores/[id]/route.ts
const { area, sede_id, active, role } = await req.json();

// Update the .update call
.update({ 
  area: area || null, 
  sede_id: sede_id || null, 
  active,
  role: role || undefined // Only update if role is provided
})
```

### Task 2: Move Area Management to Personal Page

**Files:**
- Modify: `app/admin/personal/page.tsx`
- Modify: `app/admin/colaboradores/page.tsx`

- [ ] **Step 1: Move UI buttons and logic to Personal Page**

In `app/admin/personal/page.tsx`, add the "Administrar Áreas" button to the Topbar right:

```tsx
// In Topbar right
<div className="flex items-center gap-2">
  <button
    onClick={() => setShowAreasModal(true)}
    className="inline-flex items-center h-9 px-4 rounded-full border border-[#e8e4dc] bg-white hover:bg-[#f6f3ee] text-[#15182b] text-[13px] font-[600] transition-colors"
  >
    Administrar Áreas
  </button>
  <button
    onClick={() => { resetForm(); setShowModal(true); }}
    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] transition-colors"
  >
    <Plus className="h-4 w-4" />
    <span className="hidden sm:inline">Nuevo usuario</span>
  </button>
</div>
```

- [ ] **Step 2: Add Area Management logic to Personal Page**

Copy state and handlers (`handleCreateArea`, `handleDeleteArea`) from `ColaboradoresPage` to `PersonalPage`. Ensure `Dialog` for areas is rendered.

- [ ] **Step 3: Remove Area Management from Colaboradores Page**

Remove the button and the `showAreasModal` logic from `app/admin/colaboradores/page.tsx`.

### Task 3: Implement Profile Editing in Personal Page Table

**Files:**
- Modify: `app/admin/personal/page.tsx`

- [ ] **Step 1: Add Edit State and Modal to Personal Page**

Add `editProfile`, `editRole`, `editSede`, `editArea`, `editActive` state. Add `handleSaveEdit` function.

- [ ] **Step 2: Add Edit button to Table**

Update the "TableBody" in `app/admin/personal/page.tsx` to include an Edit button in the last cell (or as a new cell).

```tsx
<TableCell>
  <div className="flex justify-end gap-2">
    <button
      onClick={() => {
        setEditProfile(p);
        setEditRole(p.role);
        setEditSede(p.sede_id || "");
        setEditArea(p.area || "");
        setEditActive(p.active);
      }}
      className="h-7 px-2.5 rounded-lg text-xs text-[#6b7185] hover:bg-[#eaf0fb] transition-colors font-medium border border-[#e8e4dc]"
    >
      Editar
    </button>
    {p.role === "COLLABORATOR" && (
      <button
        onClick={() => router.push(`/admin/colaboradores/${p.id}`)}
        className="h-7 px-2.5 rounded-lg text-xs text-[#2d4a8a] hover:bg-[#eaf0fb] transition-colors font-medium"
      >
        Ver
      </button>
    )}
  </div>
</TableCell>
```

- [ ] **Step 3: Add the Edit Dialog to Personal Page**

Render a `Dialog` similar to the one in Colaboradores, but adding the **Rol** field:

```tsx
<div className="space-y-1.5">
  <label className="text-sm font-medium text-[#15182b]">Rol</label>
  <Select value={editRole} onValueChange={(v) => setEditRole(v as any)}>
    <SelectTrigger className="h-10 rounded-xl border-[#e8e4dc]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="COLLABORATOR">Colaborador</SelectItem>
      <SelectItem value="ADMIN">Admin</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Task 4: Add Role Editing to Colaboradores Edit Modal

**Files:**
- Modify: `app/admin/colaboradores/page.tsx`

- [ ] **Step 1: Add Role field to Colaboradores Edit Modal**

Add `editRole` state and the `Select` field to the dialog in `app/admin/colaboradores/page.tsx` so teachers/colaboradores can also be promoted to ADMIN from there.
