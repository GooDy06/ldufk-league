import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { sharedAuthCookieOptions } from "@/lib/supabase/cookie-options";

function hostname(request: NextRequest) {
  return (request.headers.get("host") || "").split(":")[0].toLowerCase();
}

function routedPath(request: NextRequest) {
  const host = hostname(request);
  const path = request.nextUrl.pathname;

  if (path.startsWith("/map-images/") || path.startsWith("/assets/") || path.startsWith("/public/")) {
    return path;
  }

  if (host === "cams.ldufk.com") {
    if (path.startsWith("/api/") || path.startsWith("/cams")) return path;
    return `/cams${path === "/" ? "" : path}`;
  }

  if (host === "admin.ldufk.com") {
    if (path.startsWith("/api/")) return path;
    return path.startsWith("/admin") ? path : `/admin${path === "/" ? "" : path}`;
  }

  if (host === "veto.ldufk.com") {
    if (path.startsWith("/api/") || path.startsWith("/veto")) return path;
    return path.startsWith("/veto") ? path : `/veto${path === "/" ? "" : path}`;
  }

  return path;
}

function routedResponse(request: NextRequest, path: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ldufk-routed-path", path);
  requestHeaders.set("x-ldufk-hostname", hostname(request));

  if (path === request.nextUrl.pathname) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const path = routedPath(request);
  const makeResponse = () => routedResponse(request, path);
  let response = makeResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: sharedAuthCookieOptions(hostname(request)),
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = makeResponse();
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = makeResponse();
          response.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  const isAdminRoute = path.startsWith("/admin");
  const isAdminHome = path === "/admin";
  const isCamsAdminRoute = path.startsWith("/cams/admin");
  const email = data.user?.email?.trim().toLowerCase();
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (isAdminRoute && !isAdminHome) {
    let hasAdminAccess = Boolean(email && email === allowedEmail);

    if (email && !hasAdminAccess) {
      const { data: adminUser } = await supabase.from("admin_users").select("role").eq("email", email).maybeSingle();
      hasAdminAccess = Boolean(adminUser?.role);
    }

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL(hostname(request) === "admin.ldufk.com" ? "/" : "/admin", request.url));
    }
  }

  if (isCamsAdminRoute) {
    let hasAdminAccess = Boolean(email && email === allowedEmail);

    if (email && !hasAdminAccess) {
      const { data: adminUser } = await supabase.from("admin_users").select("role").eq("email", email).maybeSingle();
      hasAdminAccess = Boolean(adminUser?.role);
    }

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL(hostname(request) === "cams.ldufk.com" ? "https://admin.ldufk.com" : "/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|demo-viewer/assets).*)"]
};
