export const FALLBACK_HERO_IMAGE = "/assets/winners-hero-1400.jpg";

export function publicImageUrl(url: string | null | undefined) {
  if (!url || url.startsWith("/") || url.startsWith("data:")) return url || "";

  try {
    const imageUrl = new URL(url);
    const useProxy =
      imageUrl.hostname === "i.ibb.co" ||
      imageUrl.hostname === "i.ytimg.com" ||
      imageUrl.hostname.endsWith(".supabase.co");

    return useProxy ? `/api/image?url=${encodeURIComponent(url)}` : url;
  } catch {
    return url;
  }
}
