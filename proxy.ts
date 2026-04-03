import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // No session → send to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get role from profiles — guard against network errors
  let role: "ADMIN" | "COLLABORATOR" | undefined;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role as typeof role;
  } catch {
    // If profiles query fails, let the request through — auth is already verified
    return response;
  }

  // If role couldn't be determined, let it through
  if (!role) return response;

  // /admin/** → requires ADMIN role
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // /portal/** → requires COLLABORATOR role
  if (pathname.startsWith("/portal") && role !== "COLLABORATOR") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
