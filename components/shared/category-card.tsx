import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

export type CategoryCardProps = {
  category: Category;
  locale?: string;
  exploreLabel?: string;
  className?: string;
  featured?: boolean;
};

export function CategoryCard({
  category,
  locale,
  exploreLabel,
  className,
  featured = false,
}: CategoryCardProps) {
  const rtl = locale === "ar";
  const exploreText = exploreLabel ?? (rtl ? "تسوق المجموعة الآن" : "Explore Collection Now");
  const name = rtl ? category.name_ar || category.name : category.name;
  const descriptionRaw = rtl
    ? (category.description_ar || "").trim() || (category.description || "").trim()
    : (category.description || "").trim();
  const description = descriptionRaw || undefined;
  const href = `/products?category_slug=${category.slug}`;
  const image = category.image_url || category.image;

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-[6px] border border-border bg-card",
        "transition-colors duration-150",
        "hover:border-primary/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        !className?.includes("w-full") && !className?.includes("aspect") && "w-94.75 shrink-0 aspect-379/364",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width:640px) 80vw, (max-width:1024px) 33vw, 20vw"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col",
          featured ? "px-4 pb-4" : "px-3 pb-3"
        )}
      >
        <p
          className={cn(
            "leading-tight text-white",
            featured
              ? rtl
                ? "font-cairo font-semibold text-[18px]"
                : "font-chillax text-[18px] font-semibold"
              : rtl
                ? "font-cairo font-semibold text-[15px]"
                : "font-chillax text-[15px] font-semibold"
          )}
        >
          {name}
        </p>

        {description ? (
          <p
            className={cn(
              "mt-1 line-clamp-2 text-[12px] leading-snug text-white/70",
              rtl && "font-cairo"
            )}
          >
            {description}
          </p>
        ) : null}

        <span
          className={cn(
            "mt-1.5 text-[12px] font-medium text-white/80 group-hover:text-white",
            rtl && "font-cairo"
          )}
        >
          {exploreText}
        </span>
      </div>
    </Link>
  );
}
