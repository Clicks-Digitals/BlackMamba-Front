import type { Category } from "@/types/category";

export type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

function attachChildren(cats: Category[], parentId: string | null): CategoryWithChildren[] {
  return cats
    .filter((c) => (parentId === null ? !c.parent : c.parent === parentId))
    .map((c) => ({
      ...c,
      children: attachChildren(cats, c.id),
    }));
}

export function buildCategoryTree(cats: Category[]): CategoryWithChildren[] {
  return attachChildren(cats, null);
}

export function findCategoryBySlug(cats: Category[], slug?: string): Category | null {
  if (!slug) return null;
  return cats.find((c) => c.slug === slug) ?? null;
}

export function getChildren(cats: Category[], parentId: string): Category[] {
  return cats.filter((c) => c.parent === parentId);
}
