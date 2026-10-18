import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getBlogPost } from "@/features/blog/actions/queries";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

/** True when the body was written in the panel's rich-text editor. */
function isHtml(body: string): boolean {
  return /<\/?[a-z][a-z0-9]*(\s[^>]*)?\/?>/i.test(body);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Blog" };

  const rtl = (await getLocale()) === "ar";
  const title = rtl ? post.title_ar || post.title : post.title;
  const description = (rtl ? post.description_ar : post.description) ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  // An unpublished or deleted post must be a real 404, not a page that says
  // "not found" over a 200 — the same soft-404 that hurt the product pages.
  if (!post || !post.is_published) notFound();

  const locale = await getLocale();
  const rtl = locale === "ar";
  const title = rtl ? post.title_ar || post.title : post.title;
  const quote = rtl ? post.quote_ar || post.quote : post.quote;
  const content = rtl ? post.content_ar || post.content : post.content;

  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <Link
            href="/blog"
            className={cn(
              "mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground",
              rtl && "font-cairo"
            )}
          >
            <ArrowLeft className={cn("size-3.5", rtl && "rotate-180")} strokeWidth={2} />
            {rtl ? "كل المقالات" : "All posts"}
          </Link>
          <h1
            className={cn(
              "text-[clamp(1.6rem,3.2vw,2.5rem)] leading-tight text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {title}
          </h1>
          <p className={cn("mt-3 text-[13px] text-muted-foreground", rtl && "font-cairo")}>
            {new Date(post.created_at).toLocaleDateString(rtl ? "ar-JO" : "en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <article className="layout-page layout-gutter-x pb-20 pt-8">
        <div className={cn("max-w-3xl", rtl && "font-cairo")}>
          {post.cover_image_url ? (
            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={post.cover_image_url}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : null}

          {quote ? (
            <blockquote className="mb-8 border-s-2 border-primary ps-5 text-[17px] italic leading-relaxed text-foreground">
              {quote}
            </blockquote>
          ) : null}

          {isHtml(content) ? (
            // Rich text from the panel's editor. The API cleans it with nh3
            // against a tag allowlist before it is stored, the same as a
            // product's Overview, so it is rendered as the server sent it.
            // There is no HTML sanitizer in the storefront's dependencies to
            // clean it a second time here.
            <div
              dir={rtl ? "rtl" : "ltr"}
              className={cn(
                "prose max-w-none dark:prose-invert",
                "prose-headings:text-foreground prose-headings:tracking-wide",
                rtl ? "prose-headings:font-cairo" : "prose-headings:font-chillax",
                "prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-muted-foreground",
                "prose-a:font-semibold prose-a:text-foreground prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-foreground",
                "prose-li:text-[15px] prose-li:text-muted-foreground prose-li:marker:text-primary",
                "prose-blockquote:border-primary prose-blockquote:font-normal prose-blockquote:text-foreground",
                "prose-img:w-full prose-img:rounded-md",
                "prose-hr:border-border",
                "prose-code:text-foreground"
              )}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            // Older posts are plain text: paragraphs are blank lines.
            content
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i} className="mb-4 text-[15px] leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))
          )}
        </div>
      </article>
    </div>
  );
}
