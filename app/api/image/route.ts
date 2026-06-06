import { NextRequest, NextResponse } from "next/server";

export const revalidate = 86400;

const ALLOWED_HOSTS = new Set(["i.ibb.co", "i.ytimg.com"]);

function isAllowedHost(hostname: string) {
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".supabase.co");
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  if (!source) return new NextResponse("Missing image URL", { status: 400 });

  let imageUrl: URL;
  try {
    imageUrl = new URL(source);
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  if (imageUrl.protocol !== "https:" || !isAllowedHost(imageUrl.hostname)) {
    return new NextResponse("Image host is not allowed", { status: 403 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let response: Response;
  try {
    response = await fetch(imageUrl, {
      headers: { Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" },
      next: { revalidate: 86400 },
      signal: controller.signal
    });
  } catch {
    return new NextResponse("Image unavailable", { status: 504 });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) return new NextResponse("Image unavailable", { status: response.status });

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "Content-Type": response.headers.get("content-type") || "image/jpeg"
    }
  });
}
