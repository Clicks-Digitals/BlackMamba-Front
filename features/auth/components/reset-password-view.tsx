"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PasswordInput, SubmitButton } from "@/components/forms";
import { resetPasswordAction, type ResetPasswordData } from "@/features/auth";
import { PasswordRules } from "@/features/auth/components/password-rules";
import type { ActionState } from "@/types";
import { errorText } from "@/lib/utils";

const initialState: ActionState<ResetPasswordData, void> = { status: "idle", message: "" };

interface Props {
  email: string;
  otpCode: string;
}

export function ResetPasswordView({ email, otpCode }: Props) {
  const t = useTranslations("Auth.ResetPassword");
  const router = useRouter();
  const [state, action] = useActionState(resetPasswordAction, initialState);

  const fe = state.fieldErrors || {};
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message, { id: "reset-password-success" });
      router.push("/login");
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message,
        { id: "reset-password-error" }
      );
    }
  }, [state.status, state.message, router, t]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t("newPasswordTitle", { defaultValue: "New Password" })}</h1>
        <p className="text-muted-foreground">
          {t("newPasswordDesc", { defaultValue: "Enter your new password below." })}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {/* Hidden inputs to pass state */}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={otpCode} />

        <div>
          <PasswordInput
            name="new_password"
            label={t("newPassword", { defaultValue: "New Password" })}
            placeholder="••••••••"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            error={fe.new_password?.[0] ? errorText(t, fe.new_password[0]) : undefined}
          />
          {/* A5: the server enforces five rules; the form used to name one. */}
          <PasswordRules value={password} namespace="Auth.ResetPassword" />
        </div>

        <PasswordInput
          name="confirm_password"
          label={t("confirmPassword", { defaultValue: "Confirm Password" })}
          placeholder="••••••••"
          autoComplete="new-password"
          error={fe.confirm_password?.[0] ? errorText(t, fe.confirm_password[0]) : undefined}
       
        />

        <div className="pt-2">
          <SubmitButton className="w-full">
            {t("resetPassword", { defaultValue: "Reset Password" })}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
