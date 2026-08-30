"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input, Textarea, SubmitButton } from "@/components/forms";
import { submitContactAction, type ContactRequestInput } from "@/features/service-center";
import type { ActionState } from "@/types";

const CONTACT_INFO: { icon: LucideIcon; labelKey: string; value: string }[] = [
  { icon: Mail, labelKey: "emailLabel", value: "support@josouk.com" },
  { icon: Phone, labelKey: "phoneLabel", value: "+962 7X XXX XXXX" },
  { icon: MapPin, labelKey: "locationLabel", value: "Amman, Jordan" },
];

const initialState: ActionState<ContactRequestInput> = { status: "idle", message: "" };

const fieldClass =
  "h-11 rounded-md border-white/10 bg-white/4 px-3.5 font-chillax text-sm text-[#EDEFF0] placeholder:text-white/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200";

export function GetInTouch() {
  const t = useTranslations("ServiceCenter.getInTouch");
  const locale = useLocale();
  const rtl = locale === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(submitContactAction, initialState);
  const [sent, setSent] = useState(false);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      toast.success(t("successMessage"));
      formRef.current?.reset();
      setSent(true);
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message
      );
    }
  }, [state.status, state.message, t]);

  return (
    <section id="service-contact" className="layout-page layout-gutter-x py-16 md:py-24">
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden bg-[#121314] px-6 py-10 sm:px-8 lg:col-span-2 lg:px-10 lg:py-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 w-px bg-primary" aria-hidden />

            <div className="relative">
              <p className="bm-kicker">{t("kicker")}</p>
              <h2
                className={cn(
                  "mt-3 leading-none text-white",
                  "text-[clamp(2rem,4vw,3.25rem)]",
                  !rtl && "font-beckman uppercase tracking-wide",
                  rtl && "font-cairo font-bold"
                )}
              >
                {t("heading")}
              </h2>
              <p className={cn("mt-4 text-[14px] leading-relaxed text-white/50", rtl && "font-cairo")}>
                {t("intro")}
              </p>

              <div className="mt-8 flex flex-col gap-4">
                {CONTACT_INFO.map(({ icon: Icon, labelKey, value }) => (
                  <div key={labelKey} className="flex items-center gap-3.5 rounded-md border border-white/8 bg-white/3 px-3.5 py-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
                      <Icon className="size-4 text-[#d12f27]" strokeWidth={1.7} />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35", rtl && "font-cairo tracking-normal")}>
                        {t(labelKey as never)}
                      </p>
                      <p className="mt-0.5 text-[14px] font-medium text-white/90" dir="ltr">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-md border border-white/10 bg-black/25 p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Clock className="size-4 text-[#d12f27]" />
                <span className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40", rtl && "font-cairo tracking-normal")}>
                  {t("hoursLabel")}
                </span>
              </div>
              <p className={cn("text-[14px] font-semibold text-white/85", rtl && "font-cairo")}>{t("hoursDays")}</p>
              <p className={cn("mt-0.5 text-[13px] text-white/45", rtl && "font-cairo")}>{t("hoursTime")}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                <span className={cn("text-[12px] font-medium text-emerald-300/80", rtl && "font-cairo")}>
                  {t("replyNote")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 bg-[#17181b] px-6 py-10 sm:px-10 lg:col-span-3 lg:border-t-0 lg:border-s lg:px-12 lg:py-12">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-500/10">
                  <CheckCircle2 className="size-8 text-emerald-400" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-[28px] leading-none text-[#EDEFF0]",
                      !rtl && "font-chillax",
                      rtl && "font-cairo font-bold"
                    )}
                  >
                    {t("receivedTitle")}
                  </h3>
                  <p className={cn("mt-3 max-w-sm text-[14px] text-white/50", rtl && "font-cairo")}>
                    {t("receivedBody")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className={cn(
                    "mt-1 rounded-md border border-white/15 px-5 py-2.5 text-[13px] font-medium text-[#EDEFF0] transition-colors hover:border-primary/40 hover:bg-primary/10",
                    rtl && "font-cairo"
                  )}
                >
                  {t("another")}
                </button>
              </div>
            ) : (
              <form ref={formRef} action={action} className="flex flex-col gap-5">
                <div className="mb-1">
                  <h3
                    className={cn(
                      "text-[26px] leading-none text-[#EDEFF0] sm:text-[30px]",
                      !rtl && "font-chillax",
                      rtl && "font-cairo font-bold"
                    )}
                  >
                    {t("formTitle")}
                  </h3>
                  <p className={cn("mt-2 text-[13px] text-white/40", rtl && "font-cairo")}>
                    {t("formHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label={t("nameLabel")}
                    name="name"
                    placeholder={t("namePlaceholder")}
                    defaultValue={state.inputs?.name ?? ""}
                    error={fe.name?.[0] ? t(fe.name[0] as never) : undefined}
                    className={fieldClass}
                  />
                  <Input
                    label={t("emailLabel")}
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    defaultValue={state.inputs?.email ?? ""}
                    error={fe.email?.[0] ? t(fe.email[0] as never) : undefined}
                    className={fieldClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label={t("phoneLabel")}
                    name="phone"
                    placeholder={t("phonePlaceholder")}
                    defaultValue={state.inputs?.phone ?? ""}
                    error={fe.phone?.[0] ? t(fe.phone[0] as never) : undefined}
                    className={fieldClass}
                  />
                  <Input
                    label={t("locationLabel")}
                    name="location"
                    placeholder={t("locationPlaceholder")}
                    defaultValue={state.inputs?.location ?? ""}
                    error={fe.location?.[0] ? t(fe.location[0] as never) : undefined}
                    className={fieldClass}
                  />
                </div>

                <Input
                  label={t("subjectLabel")}
                  name="subject"
                  placeholder={t("subjectPlaceholder")}
                  defaultValue={state.inputs?.subject ?? ""}
                  error={fe.subject?.[0] ? t(fe.subject[0] as never) : undefined}
                  className={fieldClass}
                />

                <Textarea
                  label={t("messageLabel")}
                  name="message"
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  defaultValue={state.inputs?.message ?? ""}
                  error={fe.message?.[0] ? t(fe.message[0] as never) : undefined}
                  className="font-chillax rounded-md text-sm"
                />

                <SubmitButton
                  pendingText={t("submittingBtn")}
                  className={cn(
                    "flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-[#d12f27] active:scale-[0.99]",
                    rtl && "font-cairo"
                  )}
                >
                  <Send className="size-4" />
                  {t("submitBtn")}
                </SubmitButton>

                <p className={cn("text-center text-[12px] text-white/40", rtl && "font-cairo")}>
                  {t("privacy")}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
