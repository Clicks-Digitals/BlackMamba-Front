"use server";

import { apiClient } from "@/lib/api";

/**
 * A3: spend the link emailed on sign-up.
 *
 * The backend is deliberately vague about why a link failed, so there is
 * nothing to distinguish here — a wrong, expired or already-spent token all
 * read the same to a caller who is guessing.
 */
export async function verifyEmailAction(
  token: string
): Promise<{ ok: boolean; message: string }> {
  const res = await apiClient<unknown>("/users/verify-email/", {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" },
  });

  return {
    ok: res.ok,
    message:
      res.message ||
      (res.ok
        ? "Your email is confirmed."
        : "This confirmation link is not valid or has expired."),
  };
}

export async function resendVerificationAction(): Promise<{
  ok: boolean;
  message: string;
}> {
  const res = await apiClient<unknown>("/users/resend-verification/", {
    method: "POST",
  });

  return {
    ok: res.ok,
    message:
      res.message ||
      (res.ok ? "We have sent you a new link." : "We couldn't send that just now."),
  };
}
