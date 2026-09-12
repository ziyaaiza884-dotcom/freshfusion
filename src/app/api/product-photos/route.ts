import { NextResponse } from "next/server";
import { getProductPhotoIndex } from "@/server/store";

export const runtime = "nodejs";

/**
 * Public, lightweight index of which products have a custom photo and when
 * it was last updated — {"beef-pickle": 1234567890000, ...}. Clients use the
 * timestamp to build a version-stamped, cache-forever image URL
 * (/api/media/product/<slug>/<v>) without ever shipping image bytes here.
 */
export async function GET() {
  const index = await getProductPhotoIndex();
  return NextResponse.json(index, {
    headers: { "cache-control": "no-store" },
  });
}
