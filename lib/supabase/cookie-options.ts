import type { CookieOptions } from "@supabase/ssr";

export function sharedAuthCookieOptions(hostname?: string | null): CookieOptions {
  const configuredDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();
  const host = (hostname || "").split(":")[0].toLowerCase();
  const domain = configuredDomain || (host.endsWith("ldufk.com") ? ".ldufk.com" : undefined);

  return {
    ...(domain ? { domain } : {}),
    path: "/",
    sameSite: "lax",
    secure: domain ? true : process.env.NODE_ENV === "production"
  };
}
