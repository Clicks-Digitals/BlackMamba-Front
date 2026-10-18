import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Star } from "lucide-react";
import { getTestimonials } from "@/features/testimonials/actions/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const rtl = (await getLocale()) === "ar";
  return {
    title: rtl ? "آراء العملاء" : "Customer reviews",
    description: rtl
      ? "ما يقوله عملاؤنا عن مامبا غيرز."
      : "What our customers say about Mamba Gears.",
    alternates: { canonical: "/testimonials" },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          )}
          strokeWidth={1.75}
        />
      ))}
    </div>
  );
}

export default async function Page() {
  const rtl = (await getLocale()) === "ar";
  const testimonials = await getTestimonials();

  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{rtl ? "آراء" : "Reviews"}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {rtl ? "آراء العملاء" : "Customer reviews"}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-20 pt-8">
        {testimonials.length === 0 ? (
          <p className={cn("py-16 text-center text-sm text-muted-foreground", rtl && "font-cairo")}>
            {rtl ? "لا توجد آراء بعد." : "No reviews yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.id}
                className={cn(
                  "flex h-full flex-col border border-border bg-card p-5",
                  rtl && "font-cairo"
                )}
              >
                <Stars rating={item.rating} />
                <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-muted-foreground">
                  {item.title ? (
                    <span className="mb-1.5 block text-[15px] font-semibold text-foreground">
                      {item.title}
                    </span>
                  ) : null}
                  {item.content}
                </blockquote>
                <figcaption className="mt-4 text-[12.5px] font-medium text-foreground">
                  {item.user_name}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
