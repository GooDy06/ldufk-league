import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["pub-0a716a9671504fb0822058dc0e5c6792.r2.dev"]);

function allowedDemoUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    if (!url.pathname.endsWith(".dem")) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const demoUrl = allowedDemoUrl(request.nextUrl.searchParams.get("url"));
  if (!demoUrl) return new Response("Invalid demo URL", { status: 400 });

  return Response.redirect(demoUrl, 302);
}

export async function HEAD(request: NextRequest) {
  const demoUrl = allowedDemoUrl(request.nextUrl.searchParams.get("url"));
  if (!demoUrl) return new Response(null, { status: 400 });

  return new Response(null, {
    status: 302,
    headers: {
      location: demoUrl.toString(),
      "cache-control": "no-store",
    },
  });
}
