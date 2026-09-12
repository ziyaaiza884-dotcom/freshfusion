"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, UploadCloud } from "lucide-react";

export interface MediaSlotView {
  key: string;
  label: string;
  hint: string;
  src: string;
  isCustom: boolean;
}

/** downscale + re-encode in the browser so uploads stay small — there's no
 *  server-side image processing here (no sharp in production deps) */
async function compressImage(
  file: File,
  maxDim: number,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new Error("Could not process image");
  return blob;
}

export function MediaManager({ slots }: { slots: MediaSlotView[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {slots.map((slot) => (
        <MediaSlotCard key={slot.key} slot={slot} />
      ))}
    </div>
  );
}

function MediaSlotCard({ slot }: { slot: MediaSlotView }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const maxDim = slot.key === "hero-bg" ? 2400 : 1000;
      const blob = await compressImage(file, maxDim, 0.85);
      setPreview(URL.createObjectURL(blob));

      const form = new FormData();
      form.append("file", blob, "upload.jpg");
      const res = await fetch(`/api/admin/media/${slot.key}`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Upload failed (${res.status})`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${slot.key}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Reset failed");
      setPreview(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="aspect-video overflow-hidden rounded-md border border-border bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview only; source can be a blob: URL next/image can't optimize */}
        <img
          src={preview ?? slot.src}
          alt={slot.label}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{slot.label}</h3>
      <p className="text-xs text-muted-foreground">{slot.hint}</p>
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          {slot.isCustom ? "Replace" : "Upload"}
        </button>
        {slot.isCustom && (
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
        )}
      </div>
    </div>
  );
}
