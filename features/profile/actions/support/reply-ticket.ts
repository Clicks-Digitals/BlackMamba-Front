"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api";
import { formDataToObject, validateData } from "@/lib/utils";
import type { ActionState } from "@/types";
import {
  createSupportReplySchema,
  type CreateSupportReplyValues,
  type TicketReply,
} from "@/features/profile";

export async function createTicketReplyAction(
  ticketId: string,
  _prev: ActionState<CreateSupportReplyValues, TicketReply>,
  formData: FormData
): Promise<ActionState<CreateSupportReplyValues, TicketReply>> {
  const hasFile =
    formData.get("attachment") instanceof File &&
    (formData.get("attachment") as File).size > 0;

  const rawData = formDataToObject(formData);
  delete rawData.attachment;

  const validated = validateData(createSupportReplySchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof CreateSupportReplyValues, string[]>>,
      inputs: rawData as unknown as Partial<CreateSupportReplyValues>,
    };
  }

  const res = await apiClient<TicketReply>(`/support/${ticketId}/reply/`, {
    method: "POST",
    body: hasFile ? formData : JSON.stringify({ body: validated.data.body }),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to send reply. Please try again.",
      inputs: rawData as unknown as Partial<CreateSupportReplyValues>,
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: res.message || "Reply sent.",
    data: res.data,
  };
}
