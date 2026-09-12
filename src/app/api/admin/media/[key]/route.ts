import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { clearMediaItem, setMediaItem } from "@/server/store";
import { isMediaKey, MAX_UPLOAD_BYTES } from "@/lib/media";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { key } = await params;
  if (!isMediaKey(key)) {
    return NextResponse.json({ error: "Unknown media slot" }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 422 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WebP images are allowed" },
      { status: 422 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 4MB)" },
      { status: 422 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  await setMediaItem(key, data, file.type);

  revalidatePath("/");
  revalidatePath("/admin/media");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { key } = await params;
  if (!isMediaKey(key)) {
    return NextResponse.json({ error: "Unknown media slot" }, { status: 404 });
  }

  await clearMediaItem(key);
  revalidatePath("/");
  revalidatePath("/admin/media");
  return NextResponse.json({ ok: true });
}
