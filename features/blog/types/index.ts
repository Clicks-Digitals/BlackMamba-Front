/** Matches PostListSerializer from /api/blog/ */
export interface BlogPostCard {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  cover_image_url: string | null;
  created_at: string;
}

/** Matches PostSerializer from /api/blog/{slug}/ */
export interface BlogPost extends BlogPostCard {
  content: string;
  content_ar: string | null;
  quote: string | null;
  quote_ar: string | null;
  is_published: boolean;
  updated_at: string;
}
