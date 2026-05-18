const mapImages: Record<string, string> = {
  de_ancient: "/map-images/de_ancient.jpg",
  de_ancient_night: "/map-images/de_ancient.jpg",
  de_anubis: "/map-images/de_anubis.jpg",
  de_dust2: "/map-images/de_dust2.jpg",
  de_inferno: "/map-images/de_inferno.jpg",
  de_mirage: "/map-images/de_mirage.jpg",
  de_nuke: "/map-images/de_nuke.jpg",
  de_overpass: "/map-images/de_overpass.jpg",
  de_train: "/map-images/de_train.jpg",
  de_vertigo: "/map-images/de_vertigo.jpg"
};

export function mapImageFor(value: string | null | undefined) {
  if (!value) return null;
  return mapImages[value] || null;
}
