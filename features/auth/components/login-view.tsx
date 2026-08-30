"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { Input, PasswordInput, SubmitButton } from "@/components/forms";
import { useAuthStore } from "@/stores/auth-store";
import { loginAction, type LoginData } from "@/features/auth";
import type { ActionState, User as UserType } from "@/types";

const initialState: ActionState<LoginData, UserType> = { status: "idle", message: "" };

const FOCUS_RING = "focus:border-primary focus:ring-2 focus:ring-primary/10";

export function LoginView() {
  const t = useTranslations("Auth.Login");
  const router = useRouter();
  const { setAuth, logout } = useAuthStore((s) => s);
  const [state, action] = useActionState(loginAction, initialState);

  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("error") === "session_expired";
  const callbackUrl = searchParams.get("callback");
  const fe = state.fieldErrors || {};

  useEffect(() => {
    if (state.status === "success" && state.data) {
      setAuth(state.data);
      toast.success(state.message, { id: "login-success" });
      router.push(callbackUrl || "/");
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message,
      );
    }
  }, [state, router, setAuth, callbackUrl, t]);

  useEffect(() => {
    if (sessionExpired) {
      logout();
      toast.error(t("sessionExpired"), { id: "session-expired" });
    }
    // not add logout to deps to avoid unwanted logout loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionExpired]);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && !sessionExpired) {
      router.replace(callbackUrl || "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sessionExpired]);

  return (
    <div className="w-full rounded-lg border border-white/8 bg-[#161718] p-8 shadow-[0_12px_32px_-6px_rgba(158,29,32,0.18)] md:p-10">
      <div className="mb-8 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <div className="mb-8 space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-[#d12f27]">
          <Lock className="size-5" strokeWidth={1.8} />
        </span>
        <h1 className="font-chillax text-3xl tracking-wide text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-[12px] uppercase tracking-widest text-white/45">
          {t("subtitle")}
        </p>
      </div>

      <form action={action} className="space-y-5">
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

        <PasswordInput
          icon={Lock}
          label={t("passwordLabel")}
          name="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          defaultValue={state.inputs?.password ?? ""}
          error={fe.password?.[0] && t(fe.password[0] as never)}
          className={FOCUS_RING}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-white/45 hover:text-foreground hover:underline transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <SubmitButton
          pendingText={t("submittingBtn")}
          className="w-full rounded-md bg-primary h-11 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-primary/90"
        >
          {t("submitBtn")}
        </SubmitButton>

        <p className="text-center text-[12px] text-white/45">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {t("registerLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
