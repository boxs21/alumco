import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, area, sede_id } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (email, password, name, role)" },
        { status: 400 }
      );
    }

    // Inicializamos Supabase con la service role key usando nuestro helper
    // (O se podría usar createClient directamente: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!))
    const admin = createAdminClient();

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Error al crear el usuario en Auth" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Actualizar el perfil en la tabla profiles (ya fue creado por el trigger de la base de datos)
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        name,
        email,
        role,
        area: area || null,
        sede_id: sede_id || null,
        active: true,
      })
      .eq("id", userId);

    if (profileError) {
      // Intento de rollback si falla la creación del perfil
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileError.message || "Error al crear el perfil del usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: userId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
