"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input, SubmitButton } from "@/components/forms";
import { verifyOtpAction, forgotPasswordAction, type VerifyOtpData } from "@/features/auth";
import type { ActionState } from "@/types";

const initialState: ActionState<VerifyOtpData, void> = { status: "idle", message: "" };

interface Props {
  email: string;
  onSuccess: (code: string) => void;
}

export function VerifyOtpView({ email, onSuccess }: Props) {
  const t = useTranslations("Auth.ResetPassword");
  const [state, action] = useActionState(verifyOtpAction, initialState);
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      const res = await forgotPasswordAction({ status: "idle", message: "" }, formData);
      if (res.status === "success") {
        toast.success(t("codeResent", { defaultValue: "Code resent successfully" }), { id: "resend-success" });
      } else {
        toast.error(res.message || t("resendFailed"), { id: "resend-error" });
      }
    });
  };

  const fe = state.fieldErrors || {};

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message, { id: "verify-otp-success" });
      if (state.inputs?.code) {
        onSuccess(state.inputs.code);
      }
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message,
        { id: "verify-otp-error" }
      );
    }
  }, [state.status, state.message, state.inputs, onSuccess, t]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t("verifyOtpTitle", { defaultValue: "Verify OTP" })}</h1>
        <p className="text-muted-foreground">
          {t("verifyOtpDesc", { defaultValue: "Enter the code sent to your email." })}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {/* Hidden email input so it passes in FormData */}
        <input type="hidden" name="email" value={email} />

        <Input
          name="code"
          label={t("code", { defaultValue: "OTP Code" })}
          type="text"
          placeholder="123456"
          error={fe.code?.[0] ? t(fe.code[0] as never) : undefined}
          defaultValue={state.inputs?.code || ""}
      
        />

        <div className="pt-4 space-y-3">
          <SubmitButton className="w-full">
            {t("verify", { defaultValue: "Verify" })}
          </SubmitButton>
          
          <button 
            type="button" 
            onClick={handleResend}
            disabled={isPending}
            className="w-full text-sm text-primary hover:underline disabled:opacity-50"
          >
            {isPending ? t("resending", { defaultValue: "Resending..." }) : t("resendCode", { defaultValue: "Resend Code" })}
          </button>
        </div>
      </form>
    </div>
  );
}
