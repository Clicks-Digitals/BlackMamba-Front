export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  image: string;
  image_url: string;
  parent: string;
  parent_name: string;
  is_active: boolean;
  is_featured: boolean;
  is_nav: boolean;
  display_order: number;
  brands: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTree {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  children: CategoryTree[];
}
