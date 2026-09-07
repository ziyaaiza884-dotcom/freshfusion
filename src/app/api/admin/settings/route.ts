import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { denyIfNotAdmin } from "@/server/admin-guard";
import { getSettings, OrderError, updateSettings } from "@/server/store";
import { isThemeId } from "@/lib/themes";

export const runtime = "nodejs";

export async function GET() {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  return NextResponse.json({ settings: await getSettings() });
}

export async function PATCH(req: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  let body: { theme?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isThemeId(body.theme)) {
    return NextResponse.json({ error: "Unknown theme" }, { status: 422 });
  }

  try {
    const settings = await updateSettings({ theme: body.theme });
    // theme lives on the storefront layout — revalidate everything under it
    revalidatePath("/", "layout");
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof OrderError ? err.message : "Could not save the theme",
      },
      { status: 400 },
    );
  }
}
