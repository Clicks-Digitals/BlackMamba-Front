"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import type { AuthResponse } from "@/features/auth";
import type { ActionState, User } from "@/types";

type GoogleAuthResponse = AuthResponse & { created: boolean };
export type GoogleLoginResult = ActionState<never, User> & { created?: boolean };

/**
 * Exchange a Google Identity Services ID token for our own session.
 *
 * The ID token is verified server-side by Django (never trusted here), which
 * returns the same JWT pair as a password login, so the cookies set below are
 * identical to the ones loginAction sets.
 */
export async function googleLoginAction(idToken: string): Promise<GoogleLoginResult> {
  if (!idToken) {
    return { status: "error", message: "No Google credential received." };
  }

  const res = await apiClient<GoogleAuthResponse>("/users/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Google sign-in failed. Please try again.",
    };
  }

  const { tokens, user, created } = res.data;
  if (!tokens?.access) {
    return {
      status: "error",
      message: "Authentication succeeded but no access token received.",
    };
  }

  const cookieStore = await cookies();
  // Guest cart/build tokens belong to the anonymous session that just ended.
  cookieStore.delete("cart_token");
  cookieStore.delete("pc_build_token");

  const cookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  cookieStore.set("token", tokens.access, cookieOptions);
  if (user) {
    cookieStore.set("role", JSON.stringify(user.role), cookieOptions);
  }

  return {
    status: "success",
    message: res.message || "Signed in with Google.",
    data: user,
    created,
  };
}
