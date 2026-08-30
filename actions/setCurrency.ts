"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setCurrency(code: string) {
  if (!code) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_CURRENCY", code.toUpperCase(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  revalidatePath("/", "layout");
}
