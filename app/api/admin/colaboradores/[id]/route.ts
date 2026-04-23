import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { area, sede_id, active, role } = await req.json();
    
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({ 
        area: area || null, 
        sede_id: sede_id || null, 
        active,
        role: role || undefined
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
