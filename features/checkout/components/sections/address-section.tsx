"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/forms/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Address } from "@/types";

interface AddressSectionProps {
  isLoggedIn: boolean;
  addresses: Address[];
  selectedAddressId: string | null;
  onAddressChange: (id: string) => void;
  fieldErrors?: Partial<Record<string, string[]>>;
  defaultValues?: Record<string, unknown>;
  stepNumber: number;
}

const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return "";
    }
  }
  return (current as string) || "";
};

export function AddressSection({
  isLoggedIn,
  addresses,
  selectedAddressId,
  onAddressChange,
  fieldErrors = {},
  defaultValues = {},
  stepNumber
}: AddressSectionProps) {
  const t = useTranslations("Checkout");
  const locale = useLocale();

  return (
    <section className="space-y-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {stepNumber}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#EDEFF0]">
          {t("section.shippingAddress")}
        </h3>
        <Separator className="flex-1 bg-white/10" />
      </div>

      {isLoggedIn ? (
        <>
          {addresses.length > 0 ? (
            <RadioGroup value={selectedAddressId ?? ""} onValueChange={onAddressChange}>
              <ScrollArea className="scrollbar-thin max-h-56 rounded-lg border border-[#26292C] bg-[#17181B] pe-4">
                <div className="space-y-2 p-3">
                  {addresses.map((addr, idx) => (
                    <div key={addr.id}>
                      <label
                        htmlFor={`addr-${addr.id}`}
                        className="flex cursor-pointer items-start gap-4 rounded-lg p-4 transition-colors hover:bg-white/5"
                      >
                        <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-bold text-[#EDEFF0]">{addr.title}</p>
                            {addr.is_default && (
                              <span className="inline-block rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400">
                                {t("address.default")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50">
                            {addr.street}
                            {addr.building && `, ${addr.building}`}
                          </p>
                          <p className="text-xs text-white/50">{addr.city}</p>
                          <p className="text-xs text-white/50" dir={locale === "ar" ? "ltr" : undefined}>
                            {addr.phone}
                          </p>
                        </div>
                      </label>
                      {idx < addresses.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </RadioGroup>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-white/15 p-5 text-center">
              <p className="mb-3 text-sm text-white/50">{t("address.noSaved")}</p>
              <Link
                href="/profile?tab=addresses"
                className="inline-flex items-center gap-2 rounded-lg border border-[#26292C] bg-white/4 px-3 py-2 text-sm font-medium text-[#EDEFF0] hover:border-[#9e1d20]/40 hover:bg-[#9e1d20]/15"
              >
                {t("address.addFromProfile")}
                <ChevronRight size={16} className="rtl:rotate-180" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Sign-in nudge for guests */}
          <div className="flex items-center justify-between rounded-lg border border-[#26292C] bg-[#17181B] px-4 py-3">
            <p className="text-sm text-white/50">
              {locale === "ar" ? "هل لديك حساب؟" : "Have an account?"}
            </p>
            <Link
              href={`/login?callback=${encodeURIComponent("/checkout")}`}
              className="text-sm font-semibold text-[#d12f27] hover:underline"
            >
              {locale === "ar" ? "تسجيل الدخول" : "Sign in"}
              <ChevronRight size={14} className="ms-1 inline-block rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t("guest.addressTitle")}
              name="shipping_address.title"
              placeholder={t("guest.addressTitlePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.title")}
              error={fieldErrors?.["shipping_address.title"]?.[0]}
              required
            />
            <Input
              label={t("guest.fullName")}
              name="shipping_address.full_name"
              placeholder={t("guest.fullNamePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.full_name")}
              error={fieldErrors?.["shipping_address.full_name"]?.[0]}
              required
            />
            <Input
              label={t("guest.email")}
              name="guest_email"
              type="email"
              placeholder={t("guest.emailPlaceholder")}
              defaultValue={(defaultValues?.guest_email as string) ?? ""}
              error={fieldErrors?.guest_email?.[0]}
              required
            />
            <Input
              label={t("guest.phone")}
              name="shipping_address.phone"
              placeholder={t("guest.phonePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.phone")}
              error={fieldErrors?.["shipping_address.phone"]?.[0]}
              required
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t("guest.addressLine")}
              name="shipping_address.address_line"
              placeholder={t("guest.addressLinePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.address_line")}
              error={fieldErrors?.["shipping_address.address_line"]?.[0]}
              required
            />
            <Input
              label={t("guest.city")}
              name="shipping_address.city"
              placeholder={t("guest.cityPlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.city")}
              error={fieldErrors?.["shipping_address.city"]?.[0]}
              required
            />
            <Input
              label={t("guest.state")}
              name="shipping_address.state"
              placeholder={t("guest.statePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.state")}
              error={fieldErrors?.["shipping_address.state"]?.[0]}
              required
            />
            <Input
              label={t("guest.postalCode")}
              name="shipping_address.postal_code"
              placeholder={t("guest.postalCodePlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.postal_code")}
              error={fieldErrors?.["shipping_address.postal_code"]?.[0]}
              required
            />
            <Input
              label={t("guest.country")}
              name="shipping_address.country"
              placeholder={t("guest.countryPlaceholder")}
              defaultValue={getNestedValue(defaultValues, "shipping_address.country")}
              error={fieldErrors?.["shipping_address.country"]?.[0]}
              required
            />
          </div>
        </div>
      )}
    </section>
  );
}
