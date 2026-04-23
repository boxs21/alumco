import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("areas").select("id, name").order("name");
    if (error) throw error;
    return NextResponse.json({ areas: data }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
