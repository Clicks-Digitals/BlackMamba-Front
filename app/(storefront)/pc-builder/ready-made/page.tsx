import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getReadyMadeBuildsAction } from "@/features/pc-builder";
import { ReadyMadeCard } from "@/features/pc-builder/components/ReadyMadeCard";
import { BuilderPageShell, BuilderBadge } from "@/features/pc-builder/components/BuilderPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PCBuilder.readyMade");
  return { title: t("title") };
}

export default async function ReadyMadePage() {
  const builds = await getReadyMadeBuildsAction();
  const locale = await getLocale();
  const rtl = locale === "ar";
  const t = await getTranslations("PCBuilder");
  const tReadyMade = await getTranslations("PCBuilder.readyMade");
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  return (
    <BuilderPageShell>
      <div className="w-full" dir={rtl ? "rtl" : "ltr"}>
        <header className="mb-10">
          <Link
            href="/pc-builder"
            className="mb-4 flex w-fit items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            <BackIcon className="h-3.5 w-3.5" />
            {t("backToBuilder")}
          </Link>
          <BuilderBadge>{t("badge")}</BuilderBadge>
          <h1
            className={
              rtl
                ? "font-cairo text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-none text-white"
                : "font-chillax text-[clamp(2rem,4.5vw,3.25rem)] uppercase leading-none tracking-wide text-white"
            }
          >
            {tReadyMade("title")}
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/50 sm:text-base">{tReadyMade("subtitle")}</p>
        </header>

        {builds.length === 0 ? (
          <p className="text-white/40">{tReadyMade("noBuilds")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {builds.map((build) => (
              <ReadyMadeCard key={build.id} build={build} />
            ))}
          </div>
        )}
      </div>
    </BuilderPageShell>
  );
}
