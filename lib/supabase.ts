import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — use in Client Components
export function createClient() {
  return createBrowserClient(url, anonKey);
}

// Server client — use in Server Components, Route Handlers, and proxy
export function createServerSupabaseClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — cookies can't be set,
          // but the session can still be read.
        }
      },
    },
  });
}
