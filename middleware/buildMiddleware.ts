import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function buildMiddleware(
  request: NextRequest,
  response: NextResponse | null
): Promise<NextResponse | null> {
  const token = request.cookies.get("token");
  if (token || request.cookies.get("pc_build_token")) return response;

  const res = response ?? NextResponse.next();
  res.cookies.set("pc_build_token", crypto.randomUUID(), {
    sameSite: "lax",
    path: "/"
  });
  return res;
}
