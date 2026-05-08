import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { AdminRole } from "@/lib/types";

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
  const email = data.user?.email?.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    return { supabase, user: null, email, role: null as AdminRole | null };
  }

  if (email === adminEmail) {
    return { supabase, user: data.user, email, role: "main_admin" as AdminRole };
  }

  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("email", email).maybeSingle();
  const role = adminUser?.role as AdminRole | undefined;

  if (!role) {
    return { supabase, user: null, email, role: null as AdminRole | null };
  }

  return { supabase, user: data.user, email, role };
}
