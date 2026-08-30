import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "@/middleware/helper/RolesAndRoutes";
import type { Role } from "@/types";

/** Decode JWT payload and check if the token is expired. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" && exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("token");
  res.cookies.delete("role");
  res.cookies.delete("cart_token");
  res.cookies.delete("pc_build_token");
}

export async function authMiddleware(
  request: NextRequest,
  response: NextResponse | null
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const roleRaw = request.cookies.get("role")?.value;
  const token = request.cookies.get("token")?.value;

  const role = roleRaw ? roleRaw.replace(/^"|"$/g, "").trim() : undefined;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (token && isTokenExpired(token)) {
    if (isAuthPage) {
      const res = response ?? NextResponse.next();
      clearAuthCookies(res);
      return res;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    loginUrl.searchParams.set("callback", pathname);
    const res = NextResponse.redirect(loginUrl);
    clearAuthCookies(res);
    return res;
  }

  // Whether an authenticated user should be bounced off /login or /register is decided
  // client-side (LoginView/RegisterView, via the auth store) instead of here — the `token`
  // cookie alone isn't reliable proof of a valid session (it can be stale after the API
  // rejects it), and bouncing on its presence alone caused the login page to redirect home
  // before the user ever saw it.
  if (isAuthPage) return response || NextResponse.next();

  const route = routes.find((r) => pathname.startsWith(r.path));

  if (!route) return response || NextResponse.next();

  // No token at all → redirect to login with callback so user lands back here after login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callback", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token but wrong role → redirect to home (not login, to avoid a loop)
  if (!role || !route.roles.includes(role as Role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response || NextResponse.next();
}
