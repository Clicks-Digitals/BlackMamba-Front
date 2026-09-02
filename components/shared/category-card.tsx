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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[12px] shrink-0"
      aria-hidden
    >
      <path d="M2.5 11.5 11.5 2.5M5 2.5h6.5V9" />
    </svg>
  );
}

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
        "group relative block overflow-hidden rounded-lg border border-white/8 bg-[#121314] bm-red-edge",
        "transition-[border-color,transform,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e0e]",
        "motion-reduce:transform-none motion-reduce:hover:translate-y-0",
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
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#17181B] to-[#9e1d20]/20" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col",
          featured ? "px-5 pb-5 sm:px-6 sm:pb-6" : "px-4 pb-4 sm:px-5 sm:pb-5"
        )}
      >
        <p
          className={cn(
            "leading-tight text-white",
            !rtl && featured
              ? "font-chillax text-[clamp(1.2rem,2vw,1.65rem)] tracking-wide"
              : !rtl
              ? "font-chillax text-[1.05rem] tracking-wide sm:text-[1.15rem]"
              : featured
              ? "font-cairo font-bold text-[20px] sm:text-[24px]"
              : "font-cairo font-bold text-[17px] sm:text-[19px]"
          )}
        >
          {name}
        </p>

        {description ? (
          <p
            className={cn(
              "mt-1.5 text-[12px] leading-snug text-white/55",
              "line-clamp-1 md:line-clamp-2",
              "md:mt-0 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-[max-height,opacity,margin] md:duration-300",
              "md:group-hover:mt-1.5 md:group-hover:max-h-12 md:group-hover:opacity-100",
              "md:group-focus-visible:mt-1.5 md:group-focus-visible:max-h-12 md:group-focus-visible:opacity-100",
              rtl && "font-cairo"
            )}
          >
            {description}
          </p>
        ) : null}

        <span
          className={cn(
            "mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 transition-colors group-hover:text-[#d12f27]",
            rtl && "font-cairo"
          )}
        >
          {exploreText}
          <span className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
            <ArrowIcon />
          </span>
        </span>
      </div>
    </Link>
  );
}
