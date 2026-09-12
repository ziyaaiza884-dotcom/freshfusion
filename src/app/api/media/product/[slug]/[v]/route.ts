import { NextResponse } from "next/server";
import { getProductPhotoItem } from "@/server/store";

export const runtime = "nodejs";

/**
 * Serves an admin-uploaded product photo. `[v]` isn't looked up — it only
 * exists so the URL changes on every re-upload, which lets the response be
 * cached forever without ever going stale in a browser or Next's image
 * optimizer. See src/app/api/media/[key]/[v]/route.ts for the equivalent
 * homepage-media route this mirrors.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; v: string }> },
) {
  const { slug } = await params;
  const item = await getProductPhotoItem(slug);
  if (!item) {
    return NextResponse.json({ error: "Not set" }, { status: 404 });
  }

  const bytes = Buffer.from(item.data, "base64");
  return new NextResponse(bytes, {
    headers: {
      "content-type": item.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
