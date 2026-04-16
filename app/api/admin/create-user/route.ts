import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // 1. Verify caller is authenticated ADMIN
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // 2. Parse body
  const { name, email, password, role, sede_id, area } = await req.json() as {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "COLLABORATOR";
    sede_id: string | null;
    area: string | null;
  };

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  // 3. Create auth user (service role — bypasses email confirmation)
  const admin = createAdminClient();
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (createError || !newUser.user) {
    const msg = createError?.message ?? "Error al crear usuario";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 4. Insert profile row
  const { error: profileError } = await admin
    .from("profiles")
    .insert({
      id: newUser.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      sede_id: sede_id || null,
      area: area || null,
      active: true,
    });

  if (profileError) {
    // Roll back: delete the auth user to avoid orphaned records
    await admin.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ id: newUser.user.id }, { status: 201 });
}
