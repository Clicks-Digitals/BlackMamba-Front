"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { PCBuild, PCPart, PCSlot, PartFilters } from "@/features/pc-builder";
import { EMPTY_PRICING } from "@/features/pc-builder/types";

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
    pricing: EMPTY_PRICING,
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
/** The server's page ceiling (StandardResultsSetPagination.max_page_size). */
const PARTS_PAGE_SIZE = 500;
/** Belt and braces: never loop past this many pages for one slot. */
const MAX_PARTS_PAGES = 10;

/**
 * Every part for a slot, not just the first page.
 *
 * This asked for 50 and stopped. Mice, coolers, cases, keyboards, monitors,
 * motherboards and headsets all have more than that, and "Compatible only"
 * and the "N compatible" count are worked out here, on the client - so a
 * compatible part past the 50th did not just need a search, it was
 * invisible to the filter and missing from the count. The biggest slot is
 * about a hundred parts, so the whole slot comes back in one page; the loop
 * is there in case one ever outgrows it.
 */
export async function getPartsForSlotAction(
  slot: PCSlot,
  buildId: string,
  search?: string
): Promise<PCPart[]> {
  const parts: PCPart[] = [];
  for (let page = 1; page <= MAX_PARTS_PAGES; page += 1) {
    const params = new URLSearchParams({
      slot,
      compatible_with: buildId,
      page: String(page),
      page_size: String(PARTS_PAGE_SIZE),
    });
    if (search) params.set("search", search);

    const res = await apiClient<PaginatedResponse<PCPart>>(`/pc-builder/parts/?${params.toString()}`, {
      cache: "no-store"
    });
    if (!res.ok || !res.data) break;
    parts.push(...res.data.results);
    // The API puts the next page under links.next; a top-level `next` is
    // never sent, so testing that alone would stop after the first page.
    const next = res.data.links?.next ?? res.data.next;
    if (!next || res.data.results.length === 0) break;
  }
  return parts;
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
  const res = await apiClient<PaginatedResponse<PCBuild>>(
    "/pc-builder/ready-made/?page_size=50",
    { revalidate: 30 }
  );
  if (!res.ok || !res.data) return [];

  // Four builds with no parts were on sale at 0.00 JOD with a working Add to
  // Cart, advertising "~75 FPS" for a machine that contained nothing. A build
  // with no parts is not a product yet, so it is not offered until it has
  // some.
  return res.data.results.filter(
    (build) => (build.items?.length ?? 0) > 0 && Number(build.pricing?.total_price ?? 0) > 0
  );
}
