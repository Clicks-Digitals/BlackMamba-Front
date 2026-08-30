"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/";
import { formDataToObject, validateData } from "@/lib/utils";
import { registerSchema, type RegisterData, type AuthResponse } from "@/features/auth";
import type { ActionState, User } from "@/types";

export async function registerAction(
  _prev: ActionState<RegisterData, User>,
  formData: FormData
): Promise<ActionState<RegisterData, User>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(registerSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof RegisterData, string[]>>,
      inputs: rawData as unknown as Partial<RegisterData>,
    };
  }

  const res = await apiClient<AuthResponse>("/users/register/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });
  
  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Registration failed. Please try again.",
      inputs: rawData as unknown as Partial<RegisterData>,
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete("cart_token");
  cookieStore.delete("pc_build_token");
  const { tokens, user } = res.data;
  const { access } = tokens;

  if (access) {
    cookieStore.set("token", access, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (user) {
      cookieStore.set("role", JSON.stringify(user.role), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return {
      status: "success",
      message: res.message || "Registration successful.",
      data: user,
    };
  }

  return {
    status: "error",
    message: res.message || "Registration succeeded but no access token received.",
    inputs: rawData as unknown as Partial<RegisterData>,
  };
}
