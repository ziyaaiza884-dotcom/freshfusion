import { NextResponse } from "next/server";
import { getMedia } from "@/server/store";
import { isMediaKey } from "@/lib/media";

export const runtime = "nodejs";

/**
 * Serves an admin-uploaded homepage image. `[v]` isn't looked up — it only
 * exists so the URL changes on every re-upload, which lets the response be
 * cached forever without ever going stale in a browser or Next's own image
 * optimizer.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string; v: string }> },
) {
  const { key } = await params;
  if (!isMediaKey(key)) {
    return NextResponse.json({ error: "Unknown media slot" }, { status: 404 });
  }

  const media = await getMedia();
  const item = media[key];
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
