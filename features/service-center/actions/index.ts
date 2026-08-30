"use server";

import { apiClient } from "@/lib/api/client";
import { contactRequestSchema, type ContactRequestInput } from "@/features/service-center/schema";
import type { ActionState } from "@/types";
import { formDataToObject, validateData } from "@/lib/utils";

export async function submitContactAction(
  _prev: ActionState<ContactRequestInput>,
  formData: FormData
): Promise<ActionState<ContactRequestInput>> {
  const raw = formDataToObject(formData);
  const validated = validateData(contactRequestSchema, raw);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors,
      inputs: raw as Partial<ContactRequestInput>,
    };
  }

  const res = await apiClient("/contact/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Something went wrong. Please try again.",
      inputs: raw as Partial<ContactRequestInput>,
    };
  }

  return { status: "success", message: "Request submitted successfully!" };
}
