import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
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

  // Get role from profiles
  let role: "ADMIN" | "COLLABORATOR" | "PROFESOR" | undefined;
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("[middleware] profiles query error:", error.code, error.message);
    }
    role = profile?.role as typeof role;
  } catch (err) {
    console.error("[middleware] profiles fetch threw:", err);
  }

  // If role couldn't be determined, send to login
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // /admin/personal → ADMIN only (PROFESOR is blocked)
  if (pathname.startsWith("/admin/personal") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // /admin/** → requires ADMIN or PROFESOR
  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "PROFESOR") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // /portal/** → requires COLLABORATOR role
  if (pathname.startsWith("/portal") && role !== "COLLABORATOR") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // /profesor/** → requires PROFESOR role
  if (pathname.startsWith("/profesor") && role !== "PROFESOR") {
    const dest = role === "ADMIN" ? "/admin/dashboard" : "/portal";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/profesor/:path*"],
};
