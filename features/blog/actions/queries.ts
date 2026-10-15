import "server-only";

import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { BlogPost, BlogPostCard } from "@/features/blog/types";

/**
 * T4: the panel has had a Blogs section since launch, but /blog was a 404,
 * so nothing written there was ever reachable.
 */
export async function getBlogPosts(page = 1): Promise<PaginatedResponse<BlogPostCard>> {
  const res = await apiClient<PaginatedResponse<BlogPostCard>>(
    `/blog/?page=${page}&page_size=24`,
    { revalidate: 300 }
  );
  if (!res.ok || !res.data) {
    return { count: 0, next: null, previous: null, results: [] };
  }
  return res.data;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await apiClient<BlogPost>(`/blog/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
  return res.ok && res.data ? res.data : null;
}
