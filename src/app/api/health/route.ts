import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** tiny, DB-free endpoint for uptime pingers (cron-job.org, UptimeRobot) to
 *  keep the Render free-tier instance awake without pulling the full
 *  homepage — that response is large enough that some pingers refuse to
 *  store it and mark the check "failed" even though it reached the server. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
