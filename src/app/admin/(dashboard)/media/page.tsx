import { getMedia } from "@/server/store";
import { MEDIA_SLOTS, mediaSrc } from "@/lib/media";
import { MediaManager } from "@/components/admin/media-manager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await getMedia();
  const slots = MEDIA_SLOTS.map((slot) => ({
    key: slot.key,
    label: slot.label,
    hint: slot.hint,
    recommended: slot.recommended,
    src: mediaSrc(slot.key, media),
    isCustom: Boolean(media[slot.key]),
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Homepage media</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Replace the hero background photo and the 4 tile photos shown on the
        homepage. Changes go live for every customer immediately.
      </p>
      <div className="mt-6">
        <MediaManager slots={slots} />
      </div>
    </div>
  );
}
