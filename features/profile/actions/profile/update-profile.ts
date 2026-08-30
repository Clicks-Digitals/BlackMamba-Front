"use server";

import { apiClient } from "@/lib/api/client";
import { formDataToObject, validateData } from "@/lib/utils";
import { profileSchema, type ProfileData } from "../../schema/profile.schema";
import type { ActionState, User } from "@/types";

export async function updateProfileAction(
  _prev: ActionState<ProfileData, User>,
  formData: FormData
): Promise<ActionState<ProfileData, User>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(profileSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof ProfileData, string[]>>,
      inputs: rawData as unknown as Partial<ProfileData>,
    };
  }

  const res = await apiClient<User>("/users/me/", {
    method: "PUT",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to update profile. Please try again.",
      inputs: rawData as unknown as Partial<ProfileData>,
    };
  }

  return {
    status: "success",
    message: "Profile updated successfully.",
    data: res.data,
  };
}
