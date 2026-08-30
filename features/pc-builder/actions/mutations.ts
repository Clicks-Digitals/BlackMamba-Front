"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import type { ActionState } from "@/types";
import type {
  PCBuild,
  PCSlot,
  BrandPreference,
  GraphicsPreference,
  ColorPreference
} from "@/features/pc-builder";

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
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/items/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ slot, product: productId, variation: variationId ?? null })
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Part selected.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not select this part." };
}

export async function removeBuildItemAction(
  buildId: string,
  slot: PCSlot
): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/items/${slot}/`, {
    method: "DELETE",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Part removed.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not remove this part." };
}

export async function updateBuildPreferencesAction(
  buildId: string,
  preferences: Partial<{
    preference_processor_brand: BrandPreference;
    preference_graphics_brand: GraphicsPreference;
    preference_color: ColorPreference;
  }>
): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/preferences/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(preferences)
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Preferences updated.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not update preferences." };
}

export async function quickStartAction(
  buildId: string,
  tier: "BUDGET" | "MID" | "HIGH" | "ULTRA"
): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/quick-start/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tier })
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Quick-start build loaded.", data: res.data };
  }
  return { status: "error", message: res.message ?? "No ready-made template found for this tier yet." };
}

export async function surpriseMeAction(buildId: string): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/surprise-me/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Surprise build generated.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not generate a build." };
}

export async function buildToBudgetAction(
  buildId: string,
  budget: number
): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/build-to-budget/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ budget })
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Build assembled for your budget.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not assemble a build for this budget." };
}

export async function applyFixAction(
  buildId: string,
  issueId: string
): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/apply-fix/${encodeURIComponent(issueId)}/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Fix applied.", data: res.data };
  }
  return { status: "error", message: res.message ?? "No fix available for this issue." };
}

export async function shareBuildAction(buildId: string): Promise<ActionState<never, PCBuild>> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/share/`, {
    method: "POST",
    headers
  });

  if (res.ok && res.data) {
    return { status: "success", message: res.message ?? "Build is now shareable.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not share this build." };
}

/** Clone a publicly-shared build (by its share slug) into a new live build for the current user/guest. */
export async function cloneSharedBuildAction(shareSlug: string): Promise<ActionState<never, PCBuild>> {
  const shared = await apiClient<PCBuild>(`/pc-builder/builds/shared/${shareSlug}/`);
  if (!shared.ok || !shared.data) {
    return { status: "error", message: shared.message ?? "Shared build not found." };
  }

  const created = await apiClient<PCBuild>("/pc-builder/builds/", { method: "POST" });
  if (!created.ok || !created.data) {
    return { status: "error", message: created.message ?? "Could not start a new build." };
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

  return { status: "success", message: "Build loaded — keep customizing!", data: latest };
}

/** Clone a Ready-Made template into a new live build for the current user/guest. */
export async function customizeReadyMadeAction(
  templateId: string
): Promise<ActionState<never, PCBuild>> {
  const res = await apiClient<PCBuild>(`/pc-builder/ready-made/${templateId}/customize/`, {
    method: "POST"
  });

  if (res.ok && res.data) {
    if (!res.data.build_token) {
      return { status: "success", message: res.message ?? "Build ready to customize.", data: res.data };
    }
    const cookieStore = await cookies();
    cookieStore.set("pc_build_token", res.data.build_token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });
    return { status: "success", message: res.message ?? "Build ready to customize.", data: res.data };
  }
  return { status: "error", message: res.message ?? "Could not load this build." };
}

export async function addBuildToCartAction(
  buildId: string,
  quantity: number = 1
): Promise<ActionState<never, { count: number }>> {
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
      message: res.message ?? "Build added to cart.",
      data: { count: res.data.items.length }
    };
  }
  return { status: "error", message: res.message ?? "Could not add this build to your cart." };
}
