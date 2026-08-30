import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import runMiddlewares from "@/middleware/runMiddlewares";
import { authMiddleware } from "@/middleware/authMiddleware";
import { cartMiddleware } from "@/middleware/cartMiddleware";
import { buildMiddleware } from "@/middleware/buildMiddleware";

export async function proxy(request: NextRequest) {
  return (await runMiddlewares(request, [authMiddleware, cartMiddleware, buildMiddleware])) ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
