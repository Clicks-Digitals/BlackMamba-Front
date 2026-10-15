import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getBlogPosts } from "@/features/blog/actions/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const rtl = (await getLocale()) === "ar";
  return {
    title: rtl ? "المدونة" : "Blog",
    description: rtl
      ? "أدلة وأخبار من فريق مامبا جيرز."
      : "Guides and news from the Mamba Gears team.",
    alternates: { canonical: "/blog" },
  };
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-JO" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { results } = await getBlogPosts();

  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{rtl ? "اقرأ" : "Read"}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {rtl ? "المدونة" : "Blog"}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-20 pt-8">
        {results.length === 0 ? (
          <p className={cn("py-16 text-center text-sm text-muted-foreground", rtl && "font-cairo")}>
            {rtl ? "لا توجد مقالات بعد." : "Nothing published yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post) => {
              const title = rtl ? post.title_ar || post.title : post.title;
              const summary = rtl
                ? post.description_ar || post.description
                : post.description;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden border border-border bg-card transition-colors hover:border-primary/50"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className={cn("p-4", rtl && "font-cairo")}>
                    <p className="text-[11.5px] uppercase tracking-widest text-muted-foreground">
                      {formatDate(post.created_at, locale)}
                    </p>
                    <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground">
                      {title}
                    </h2>
                    {summary ? (
                      <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
                        {summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
