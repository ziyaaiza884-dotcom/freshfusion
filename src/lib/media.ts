/**
 * Admin-editable homepage imagery: the hero background photo and the 4 hero
 * tile photos. Each slot has a fixed key, a human label for the admin UI, and
 * a default (the bundled file shipped in the repo) that's used until an
 * admin uploads a replacement.
 */
export const MEDIA_SLOTS = [
  {
    key: "hero-bg",
    label: "Hero background photo",
    hint: "The big full-width photo behind the homepage headline.",
    default: "/images/beef-pickle-hero.jpg",
  },
  {
    key: "hero-tile-1",
    label: "Tile 1",
    hint: "Top-left square in the hero's 4-photo grid.",
    default: "/images/4suares/pickle.png",
  },
  {
    key: "hero-tile-2",
    label: "Tile 2",
    hint: "Top-right square in the hero's 4-photo grid.",
    default: "/images/4suares/spices-grid-2.jpg",
  },
  {
    key: "hero-tile-3",
    label: "Tile 3",
    hint: "Bottom-left square in the hero's 4-photo grid.",
    default: "/images/4suares/nuts-grid.jpg",
  },
  {
    key: "hero-tile-4",
    label: "Tile 4",
    hint: "Bottom-right square in the hero's 4-photo grid.",
    default: "/images/4suares/pickle-grid.jpg",
  },
] as const;

export type MediaKey = (typeof MEDIA_SLOTS)[number]["key"];

export const MEDIA_KEYS = MEDIA_SLOTS.map((s) => s.key) as MediaKey[];

export const isMediaKey = (key: unknown): key is MediaKey =>
  typeof key === "string" && (MEDIA_KEYS as string[]).includes(key);

export interface MediaItem {
  /** base64-encoded image bytes */
  data: string;
  contentType: string;
  updatedAt: string;
}

export type MediaMap = Partial<Record<MediaKey, MediaItem>>;

/**
 * The URL the storefront should render for a slot: custom upload, or the
 * bundled default. Custom uploads are served from a version-stamped path
 * (`/api/media/<key>/<v>`) so the URL itself changes on every re-upload —
 * that lets the response be cached forever without ever going stale in the
 * browser or Next's image-optimizer cache.
 */
export function mediaSrc(key: MediaKey, media: MediaMap): string {
  const item = media[key];
  if (!item) return defaultFor(key);
  const v = new Date(item.updatedAt).getTime();
  return `/api/media/${key}/${v}`;
}

function defaultFor(key: MediaKey): string {
  return MEDIA_SLOTS.find((s) => s.key === key)!.default;
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB, after client-side compression
