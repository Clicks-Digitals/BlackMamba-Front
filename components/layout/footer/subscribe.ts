"use server";

import { apiClient } from "@/lib/api/client";
import { formDataToObject, validateData } from "@/lib/utils";
import type { ActionState } from "@/types";
import { newsletterSchema, type NewsletterData } from "./schema";

interface NewsletterResponse {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(
  _prev: ActionState<NewsletterData, null>,
  formData: FormData
): Promise<ActionState<NewsletterData, null>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(newsletterSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: validated.errors as Partial<Record<keyof NewsletterData, string[]>>,
      inputs: rawData as unknown as Partial<NewsletterData>
    };
  }

  const res = await apiClient<NewsletterResponse>(`/cms/newsletter/`, {
    method: "POST",
    body: JSON.stringify(validated.data)
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message,
      inputs: validated.data as Partial<NewsletterData>
    };
  }

  return {
    status: "success",
    message: res.data?.message ?? res.message ?? "Successfully subscribed!",
    data: null
  };
}
