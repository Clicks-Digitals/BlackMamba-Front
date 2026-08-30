import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function cartMiddleware(
  request: NextRequest,
  response: NextResponse | null
): Promise<NextResponse | null> {
  const token = request.cookies.get("token");
  if (token || request.cookies.get("cart_token")) return response;

  const res = response ?? NextResponse.next();
  res.cookies.set("cart_token", crypto.randomUUID(), {
    sameSite: "lax",
    path: "/"
  });
  return res;
}
