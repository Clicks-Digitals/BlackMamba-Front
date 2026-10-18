"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { apiClient } from "@/lib/api";
import type { ActionState } from "@/types";
import type {
  PCBuild,
  PCSlot,
  BrandPreference,
  GraphicsPreference,
  ColorPreference
} from "@/features/pc-builder";

// The API's envelope says "Request completed successfully." on every call,
// so success messages are our own and translated; errors keep the server's
// wording when it gives one.
async function getBuildAuthHeaders(): Promise<Record<string, string> | undefined> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get("token")?.value;
  if (userToken) return undefined;
  const buildToken = cookieStore.get("pc_build_token")?.value;
  return buildToken ? { "X-Build-Token": buildToken } : undefined;
}

export async function upsertBuildItemAction(
  buildId: string,
  slot: PCSlot,
  productId: string,
  variationId?: string
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/items/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ slot, product: productId, variation: variationId ?? null })
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("partSelected"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("partSelectFailed") };
}

export async function removeBuildItemAction(
  buildId: string,
  slot: PCSlot
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/items/${slot}/`, {
    method: "DELETE",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("partRemoved"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("partRemoveFailed") };
}

export async function updateBuildPreferencesAction(
  buildId: string,
  preferences: Partial<{
    preference_processor_brand: BrandPreference;
    preference_graphics_brand: GraphicsPreference;
    preference_color: ColorPreference;
  }>
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/preferences/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(preferences)
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("preferencesUpdated"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("preferencesFailed") };
}

export async function quickStartAction(
  buildId: string,
  tier: "BUDGET" | "MID" | "HIGH" | "ULTRA"
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/quick-start/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tier })
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("quickStartLoaded"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("quickStartFailed") };
}

export async function surpriseMeAction(buildId: string): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/surprise-me/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("surpriseGenerated"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("surpriseFailed") };
}

export async function buildToBudgetAction(
  buildId: string,
  budget: number
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/build-to-budget/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ budget })
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("budgetBuilt"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("budgetFailed") };
}

export async function applyFixAction(
  buildId: string,
  issueId: string
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/apply-fix/${encodeURIComponent(issueId)}/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("fixApplied"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("fixFailed") };
}

export async function shareBuildAction(buildId: string): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/share/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: t("buildShared"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("shareFailed") };
}

/** Clone a publicly-shared build (by its share slug) into a new live build for the current user/guest. */
export async function cloneSharedBuildAction(shareSlug: string): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const shared = await apiClient<PCBuild>(`/pc-builder/builds/shared/${shareSlug}/`);
  if (!shared.ok || !shared.data) {
    return { status: "error", message: shared.message ?? t("sharedNotFound") };
  }

  const created = await apiClient<PCBuild>("/pc-builder/builds/", { method: "POST" });
  if (!created.ok || !created.data) {
    return { status: "error", message: created.message ?? t("newBuildFailed") };
  }

  let headers: Record<string, string> | undefined;
  if (created.data.build_token) {
    const cookieStore = await cookies();
    cookieStore.set("pc_build_token", created.data.build_token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });
    headers = { "X-Build-Token": created.data.build_token };
  }

  let latest = created.data;
  for (const item of shared.data.items) {
    const res = await apiClient<PCBuild>(`/pc-builder/builds/${created.data.id}/items/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ slot: item.slot, product: item.product, variation: item.variation })
    });
    if (res.ok && res.data) latest = res.data;
  }

  return { status: "success", message: t("sharedLoaded"), data: latest };
}

/** Clone a Ready-Made template into a new live build for the current user/guest. */
export async function customizeReadyMadeAction(
  templateId: string
): Promise<ActionState<never, PCBuild>> {
  const t = await getTranslations("PCBuilder.messages");
  const res = await apiClient<PCBuild>(`/pc-builder/ready-made/${templateId}/customize/`, {
    method: "POST"
  });

  if (res.ok && res.data) {
    if (!res.data.build_token) {
      return { status: "success", message: t("readyToCustomize"), data: res.data };
    }
    const cookieStore = await cookies();
    cookieStore.set("pc_build_token", res.data.build_token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });
    return { status: "success", message: t("readyToCustomize"), data: res.data };
  }
  return { status: "error", message: res.message ?? t("loadFailed") };
}

export async function addBuildToCartAction(
  buildId: string,
  quantity: number = 1
): Promise<ActionState<never, { count: number }>> {
  const t = await getTranslations("PCBuilder.messages");
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<{ items: unknown[] }>("/cart/add-item/", {
    method: "POST",
    headers,
    body: JSON.stringify({ build: buildId, quantity })
  });

  if (res.ok && res.data) {
    revalidatePath("/cart");
    return {
      status: "success",
      message: t("buildAdded"),
      data: { count: res.data.items.length }
    };
  }
  return { status: "error", message: res.message ?? t("buildAddFailed") };
}
