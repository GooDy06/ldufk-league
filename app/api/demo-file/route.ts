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

function demoFilename(url: URL) {
  return decodeURIComponent(url.pathname.split("/").pop() || "match.dem").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function responseHeaders(upstream: Response, demoUrl: URL) {
  const headers = new Headers();
  ["accept-ranges", "content-length", "content-range", "etag", "last-modified"].forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  });
  headers.set("content-type", upstream.headers.get("content-type") || "application/octet-stream");
  headers.set("content-disposition", `attachment; filename="${demoFilename(demoUrl)}"`);
  headers.set("cache-control", "public, max-age=86400");
  return headers;
}

export async function GET(request: NextRequest) {
  const demoUrl = allowedDemoUrl(request.nextUrl.searchParams.get("url"));
  if (!demoUrl) return new Response("Invalid demo URL", { status: 400 });

  const range = request.headers.get("range");
  const upstream = await fetch(demoUrl, {
    headers: range ? { range } : undefined,
    cache: "no-store",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream, demoUrl),
  });
}

export async function HEAD(request: NextRequest) {
  const demoUrl = allowedDemoUrl(request.nextUrl.searchParams.get("url"));
  if (!demoUrl) return new Response(null, { status: 400 });

  const upstream = await fetch(demoUrl, { method: "HEAD", cache: "no-store" });

  return new Response(null, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream, demoUrl),
  });
}
