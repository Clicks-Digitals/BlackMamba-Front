"use server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import { formDataToObject, validateData } from "@/lib/utils";
import { loginSchema, type LoginData, type AuthResponse } from "@/features/auth";
import type { ActionState, User } from "@/types";

export async function loginAction(
  _prev: ActionState<LoginData, User>,
  formData: FormData
): Promise<ActionState<LoginData, User>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(loginSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof LoginData, string[]>>,
      inputs: rawData as unknown as Partial<LoginData>,
    };
  }

  const res = await apiClient<AuthResponse>("/users/login/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });
  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Login failed. Please check your credentials.",
      inputs: rawData as unknown as Partial<LoginData>,
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
      message: res.message || "Login successful.",
      data: user,
    };
  }

  return {
    status: "error",
    message: res.message || "Authentication succeeded but no access token received.",
    inputs: rawData as unknown as Partial<LoginData>,
  };
}
