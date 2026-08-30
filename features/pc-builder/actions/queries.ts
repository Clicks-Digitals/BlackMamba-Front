"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { PCBuild, PCPart, PCSlot, PartFilters } from "@/features/pc-builder";

const BUILD_TOKEN_COOKIE = "pc_build_token";

function emptyGuestBuild(): PCBuild {
  return {
    id: "",
    build_token: null,
    is_template: false,
    tier: null,
    name: "",
    name_ar: "",
    target_performance: "",
    thumbnail: null,
    display_order: 0,
    preference_processor_brand: "ANY",
    preference_graphics_brand: "ANY",
    preference_color: "ANY",
    items: [],
    total_power_draw_watts: 0,
    has_blocking_issues: false,
    compatibility: { red_issues: [], yellow_issues: [] },
    pricing: {
      subtotal: "0",
      discount_percent: "0",
      total_price: "0",
      part_count: 0,
      next_tier: null
    },
    is_shareable: false,
    share_slug: null
  };
}

/** Build the X-Build-Token header for guests; authenticated users rely on their JWT instead. */
async function getBuildAuthHeaders(): Promise<Record<string, string> | undefined> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get("token")?.value;
  if (userToken) return undefined;

  const buildToken = cookieStore.get(BUILD_TOKEN_COOKIE)?.value;
  return buildToken ? { "X-Build-Token": buildToken } : undefined;
}

/**
 * Resolve (or create) the current user/guest's in-progress build.
 *
 * No cookie is written here on purpose — `middleware/buildMiddleware.ts` already
 * guarantees a `pc_build_token` cookie exists for guests before any page renders
 * (same pattern as `cartMiddleware.ts` / `cart_token`). `my-build` get-or-creates
 * server-side using that exact token, so there's nothing left to persist; writing
 * cookies here would fail anyway since this runs during a Server Component render,
 * not inside a Server Action/Route Handler.
 */
export async function getOrCreateBuildAction(): Promise<PCBuild> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>("/pc-builder/builds/my-build/", {
    headers,
    cache: "no-store"
  });
  if (res.ok && res.data) return res.data;
  // This backend has no PC-builder routes — render an empty guest build
  // instead of throwing, which would crash the whole /pc-builder page.
  return emptyGuestBuild();
}

export async function getBuildAction(buildId: string): Promise<PCBuild> {
  const headers = await getBuildAuthHeaders();
  const res = await apiClient<PCBuild>(`/pc-builder/builds/${buildId}/`, { headers, cache: "no-store" });
  if (res.ok && res.data) return res.data;
  return emptyGuestBuild();
}

/** Browse/search parts for a single slot — used by the part picker. */
export async function getPartsForSlotAction(
  slot: PCSlot,
  buildId: string,
  search?: string
): Promise<PCPart[]> {
  const params = new URLSearchParams({ slot, compatible_with: buildId, page_size: "50" });
  if (search) params.set("search", search);

  const res = await apiClient<PaginatedResponse<PCPart>>(`/pc-builder/parts/?${params.toString()}`, {
    cache: "no-store"
  });
  if (res.ok && res.data) return res.data.results;
  return [];
}

/** Browse-all-parts catalogue: any combination of slot/spec/price filters, paginated. */
export async function searchPartsAction(
  filters: PartFilters,
  page: number = 1
): Promise<PaginatedResponse<PCPart>> {
  const params = new URLSearchParams({ page: String(page), page_size: "24" });
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }

  const res = await apiClient<PaginatedResponse<PCPart>>(`/pc-builder/parts/?${params.toString()}`, {
    cache: "no-store"
  });
  if (res.ok && res.data) return res.data;
  return { count: 0, results: [] };
}

export async function getPartBySlugAction(slug: string, buildId?: string): Promise<PCPart | null> {
  const params = buildId ? `?compatible_with=${buildId}` : "";
  const res = await apiClient<PCPart>(`/pc-builder/parts/${slug}/${params}`, { cache: "no-store" });
  if (res.ok && res.data) return res.data;
  return null;
}

export async function getSharedBuildAction(shareSlug: string): Promise<PCBuild | null> {
  const res = await apiClient<PCBuild>(`/pc-builder/builds/shared/${shareSlug}/`, { cache: "no-store" });
  if (res.ok && res.data) return res.data;
  return null;
}

export async function getReadyMadeBuildsAction(): Promise<PCBuild[]> {
  const res = await apiClient<PaginatedResponse<PCBuild>>("/pc-builder/ready-made/?page_size=50");
  if (res.ok && res.data) return res.data.results;
  return [];
}
