"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api/client";
import { formDataToObject, validateData } from "@/lib/utils";
import type { ActionState } from "@/types";
import {
  createSupportTicketSchema,
  type CreateSupportTicketValues,
  type SupportTicket,
} from "@/features/profile";

export async function createSupportTicketAction(
  _prev: ActionState<CreateSupportTicketValues>,
  formData: FormData
): Promise<ActionState<CreateSupportTicketValues>> {
  const hasFile =
    formData.get("attachment") instanceof File &&
    (formData.get("attachment") as File).size > 0;

  const rawData = formDataToObject(formData);
  delete rawData.attachment;

  const validated = validateData(createSupportTicketSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof CreateSupportTicketValues, string[]>>,
      inputs: rawData as unknown as Partial<CreateSupportTicketValues>,
    };
  }

  const res = await apiClient<SupportTicket>("/support/", {
    method: "POST",
    body: hasFile ? formData : JSON.stringify(validated.data),
  });
 
  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to create ticket. Please try again.",
      inputs: rawData as unknown as Partial<CreateSupportTicketValues>,
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: res.message || "Ticket created successfully.",
  };
}
