"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input, SubmitButton } from "@/components/forms";
import { forgotPasswordAction, type ForgotPasswordData } from "@/features/auth";
import type { ActionState } from "@/types";

const initialState: ActionState<ForgotPasswordData, void> = { status: "idle", message: "" };

interface Props {
  onSuccess: (email: string) => void;
}

export function ForgotPasswordView({ onSuccess }: Props) {
  const t = useTranslations("Auth.ResetPassword");
  const [state, action] = useActionState(forgotPasswordAction, initialState);

  const fe = state.fieldErrors || {};

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message, { id: "forgot-password-success" });
      if (state.inputs?.email) {
        onSuccess(state.inputs.email);
      }
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message,
        { id: "forgot-password-error" }
      );
    }
  }, [state.status, state.message, state.inputs, onSuccess, t]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t("forgotPasswordTitle", { defaultValue: "Forgot Password" })}</h1>
        <p className="text-white/45">
          {t("forgotPasswordDesc", { defaultValue: "Enter your email to receive a reset code." })}
        </p>
      </div>

      <form action={action} className="space-y-4">
        <Input
          name="email"
          label={t("email", { defaultValue: "Email" })}
          type="email"
          placeholder={t("emailPlaceholder")}
          error={fe.email?.[0] ? t(fe.email[0] as never) : undefined}
          defaultValue={state.inputs?.email || ""}
        
        />

        <div className="pt-2">
          <SubmitButton className="w-full">
            {t("sendCode", { defaultValue: "Send Code" })}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
