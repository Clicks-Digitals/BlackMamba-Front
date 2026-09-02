"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { Input, PasswordInput, SubmitButton } from "@/components/forms";
import { useAuthStore } from "@/stores/auth-store";
import { registerAction, type RegisterData } from "@/features/auth";
import type { ActionState, User as UserType } from "@/types";

const initialState: ActionState<RegisterData, UserType> = { status: "idle", message: "" };

const FOCUS_RING = "focus:border-primary focus:ring-2 focus:ring-primary/10";

export function RegisterView() {
  const t = useTranslations("Auth.Register");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [state, action] = useActionState(registerAction, initialState);
  const fe = state.fieldErrors || {};

  useEffect(() => {
    if (state.status === "success" && state.data) {
      setAuth(state.data);
      toast.success(state.message, { id: "register-success" });
      router.push("/");
      router.refresh();
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message,
        { id: "register-error" }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router, setAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="dark w-full rounded-lg border border-white/8 bg-[#161718] p-8 shadow-[0_12px_32px_-6px_rgba(158,29,32,0.18)] md:p-10">
      <div className="mb-8 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <div className="mb-8 space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-[#d12f27]">
          <UserPlus className="size-5" strokeWidth={1.8} />
        </span>
        <h1 className="font-chillax text-3xl tracking-wide text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-[12px] uppercase tracking-widest text-white/45">
          {t("subtitle")}
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            icon={User}
            label={t("firstNameLabel")}
            name="f_name"
            placeholder={t("firstNamePlaceholder")}
            autoComplete="given-name"
            defaultValue={state.inputs?.f_name ?? ""}
            error={fe.f_name?.[0] && t(fe.f_name[0] as never)}
            className={FOCUS_RING}
          />
          <Input
            icon={User}
            label={t("lastNameLabel")}
            name="l_name"
            placeholder={t("lastNamePlaceholder")}
            autoComplete="family-name"
            defaultValue={state.inputs?.l_name ?? ""}
            error={fe.l_name?.[0] && t(fe.l_name[0] as never)}
            className={FOCUS_RING}
          />
        </div>

        <Input
          icon={Mail}
          label={t("emailLabel")}
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          defaultValue={state.inputs?.email ?? ""}
          error={fe.email?.[0] && t(fe.email[0] as never)}
          className={FOCUS_RING}
        />

        <Input
          icon={Phone}
          label={t("phoneLabel")}
          name="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          defaultValue={state.inputs?.phone ?? ""}
          error={fe.phone?.[0] && t(fe.phone[0] as never)}
          className={FOCUS_RING}
        />

        <PasswordInput
          icon={Lock}
          label={t("passwordLabel")}
          name="password1"
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          defaultValue={state.inputs?.password1 ?? ""}
          error={fe.password1?.[0] && t(fe.password1[0] as never)}
          className={FOCUS_RING}
        />

        <PasswordInput
          icon={Lock}
          label={t("confirmPasswordLabel")}
          name="password2"
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          defaultValue={state.inputs?.password2 ?? ""}
          error={fe.password2?.[0] && t(fe.password2[0] as never)}
          className={FOCUS_RING}
        />

        <SubmitButton
          pendingText={t("submittingBtn")}
          className="w-full rounded-md bg-primary h-11 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-primary/90"
        >
          {t("submitBtn")}
        </SubmitButton>

        <p className="text-center text-[12px] text-white/45">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {t("loginLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
