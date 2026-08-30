"use server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { apiClient } from "@/lib/api/client";
import { formDataToObject, validateData } from "@/lib/utils";
import { addressSchema, type AddressData } from "@/features/profile";
import type { ActionState, Address } from "@/types";

export async function createAddressAction(
  _prev: ActionState<AddressData, Address>,
  formData: FormData
): Promise<ActionState<AddressData, Address>> {
  const rawData = formDataToObject(formData);

  const validated = validateData(addressSchema, rawData);

  if (!validated.success) {
    const t = await getTranslations("Profile.AddressesTab");
    return {
      status: "error",
      message: t("validation.fixErrors"),
      fieldErrors: validated.errors as Partial<Record<keyof AddressData, string[]>>,
      inputs: rawData as unknown as Partial<AddressData>,
    };
  }

  const res = await apiClient<Address>("/users/addresses/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });


  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to create address. Please try again.",
      inputs: rawData as unknown as Partial<AddressData>,
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: "Address created successfully.",
    data: res.data,
  };
}
