"use server";

import { apiClient } from "@/lib/api";
import { formDataToObject, validateData } from "@/lib/utils";
import { 
  forgotPasswordSchema, 
  type ForgotPasswordData,
  verifyOtpSchema,
  type VerifyOtpData,
  resetPasswordSchema,
  type ResetPasswordData
} from "@/features/auth";
import type { ActionState } from "@/types";

export async function forgotPasswordAction(
  _prev: ActionState<ForgotPasswordData, void>,
  formData: FormData
): Promise<ActionState<ForgotPasswordData, void>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(forgotPasswordSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof ForgotPasswordData, string[]>>,
      inputs: rawData as unknown as Partial<ForgotPasswordData>,
    };
  }

  const res = await apiClient<unknown>("/users/forgot-password/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to initiate password reset.",
      inputs: rawData as unknown as Partial<ForgotPasswordData>,
    };
  }

  return {
    status: "success",
    message: res.message || "OTP sent successfully to your email.",
    inputs: rawData as unknown as Partial<ForgotPasswordData>,
  };
}

export async function verifyOtpAction(
  _prev: ActionState<VerifyOtpData, void>,
  formData: FormData
): Promise<ActionState<VerifyOtpData, void>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(verifyOtpSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof VerifyOtpData, string[]>>,
      inputs: rawData as unknown as Partial<VerifyOtpData>,
    };
  }

  const res = await apiClient<unknown>("/users/verify-otp/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Invalid or expired OTP code.",
      inputs: rawData as unknown as Partial<VerifyOtpData>,
    };
  }

  return {
    status: "success",
    message: "OTP verified correctly.",
    inputs: rawData as unknown as Partial<VerifyOtpData>,
  };
}

export async function resetPasswordAction(
  _prev: ActionState<ResetPasswordData, void>,
  formData: FormData
): Promise<ActionState<ResetPasswordData, void>> {
  const rawData = formDataToObject(formData);
  const validated = validateData(resetPasswordSchema, rawData);

  if (!validated.success) {
    return {
      status: "error",
      message: "validation.fixErrors",
      fieldErrors: validated.errors as Partial<Record<keyof ResetPasswordData, string[]>>,
      inputs: rawData as unknown as Partial<ResetPasswordData>,
    };
  }

  const res = await apiClient<unknown>("/users/reset-password/", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });

  if (!res.ok) {
    return {
      status: "error",
      message: res.message || "Failed to reset password.",
      inputs: rawData as unknown as Partial<ResetPasswordData>,
    };
  }

  return {
    status: "success",
    message: "Password reset successfully. You can now login.",
  };
}
