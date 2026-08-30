"use server";

import { apiClient } from "@/lib/api/client";
import type { ActionState, User } from "@/types";

export async function updateAvatarAction(
  formData: FormData
): Promise<ActionState<never, User>> {
  const res = await apiClient<User>("/users/me/", {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to update avatar. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Avatar updated successfully.",
    data: res.data,
  };
}
