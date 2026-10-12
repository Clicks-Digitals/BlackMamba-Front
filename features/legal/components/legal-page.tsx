import { cn } from "@/lib/utils";

export type LegalSection = {
  heading: string;
  /** Paragraphs and bullet lists, in order. A string is a paragraph. */
  body: (string | { list: string[] })[];
};

/**
 * Shared shell for the legal pages (privacy, terms, returns), so they share one
 * layout and read the same in both languages.
 */
export function LegalPage({
  kicker,
  title,
  updated,
  intro,
  sections,
  rtl,
}: {
  kicker: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
  rtl: boolean;
}) {
  return (
    <div className="bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{kicker}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-foreground",
              rtl ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {title}
          </h1>
          <p className={cn("mt-3 text-[13px] text-muted-foreground", rtl && "font-cairo")}>
            {updated}
          </p>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-20 pt-8">
        <div className={cn("max-w-3xl", rtl && "font-cairo")}>
          {intro ? (
            <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
          ) : null}

          {sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="mb-3 text-[18px] font-semibold text-foreground">
                {section.heading}
              </h2>
              {section.body.map((block, i) =>
                typeof block === "string" ? (
                  <p key={i} className="mb-3 text-[15px] leading-relaxed text-muted-foreground">
                    {block}
                  </p>
                ) : (
                  <ul key={i} className="mb-3 space-y-2">
                    {block.list.map((item, j) => (
                      <li
                        key={j}
                        className="relative ps-5 text-[15px] leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="absolute start-0 top-[0.6em] size-1.5 rounded-full bg-primary"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
