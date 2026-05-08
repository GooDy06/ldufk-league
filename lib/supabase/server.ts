import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components cannot set cookies; middleware/actions can.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Components cannot set cookies; middleware/actions can.
          }
        }
      }
    }
  );
}

export async function requireAdmin() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;

  if (!email || email !== process.env.ADMIN_EMAIL) {
    return { supabase, user: null, email };
  }

  return { supabase, user: data.user, email };
}
