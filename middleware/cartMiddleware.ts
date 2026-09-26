import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function cartMiddleware(
  request: NextRequest,
  response: NextResponse | null
): Promise<NextResponse | null> {
  // Always make sure a guest cart token exists, even while a `token` cookie is
  // present. Middleware cannot tell a valid session from an expired or
  // invalidated one, and the backend only falls back to this header when the
  // request is genuinely anonymous (Cart.get_for_request prefers the user's
  // own cart), so carrying one costs nothing.
  //
  // Skipping it whenever a `token` cookie existed left anyone holding a dead
  // token with no cart at all: the API saw an anonymous request, found no
  // X-Cart-Token, and every cart call failed with "X-Cart-Token header is
  // required for guest access" while the UI still showed them signed in.
  if (request.cookies.get("cart_token")) return response;

  const res = response ?? NextResponse.next();
  res.cookies.set("cart_token", crypto.randomUUID(), {
    sameSite: "lax",
    path: "/"
  });
  return res;
}
