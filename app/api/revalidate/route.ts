import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation, called by the panel's API when content changes.
 *
 * Without it, a product deleted in the panel kept serving its page — with a
 * working Add to Cart — until its cache window expired, which the QA pass
 * measured at over three and a half minutes. Shortening the window trades
 * speed for freshness on every page view; this refreshes only what changed,
 * when it changes.
 *
 * Does nothing unless REVALIDATE_SECRET is set on both sides, so an
 * unconfigured deployment simply falls back to time-based caching.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "not configured" }, { status: 503 });
  }

  if (request.headers.get("x-revalidate-secret") !== secret) {
    // Deliberately vague: this endpoint should not confirm the secret's shape.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let paths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: unknown };
    if (Array.isArray(body.paths)) {
      paths = body.paths.filter((p): p is string => typeof p === "string" && p.startsWith("/"));
    }
  } catch {
    return NextResponse.json({ ok: false, reason: "bad body" }, { status: 400 });
  }

  if (paths.length === 0) {
    return NextResponse.json({ ok: false, reason: "no paths" }, { status: 400 });
  }

  for (const path of paths.slice(0, 50)) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: paths.length });
}
