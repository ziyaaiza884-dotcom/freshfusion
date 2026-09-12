import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { clearProductPhoto, setProductPhoto } from "@/server/store";
import { MAX_UPLOAD_BYTES } from "@/lib/media";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { slug } = await params;

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
  try {
    await setProductPhoto(slug, data, file.type);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/inventory");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const { slug } = await params;
  await clearProductPhoto(slug);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/inventory");
  return NextResponse.json({ ok: true });
}
