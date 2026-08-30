import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("validation.invalidEmail"),
});
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({
  email: z.email("validation.invalidEmail"),
  code: z.string().min(4, "validation.codeMin"),
});
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z.object({
  email: z.email("validation.invalidEmail"),
  code: z.string().min(4, "validation.codeMin"),
  new_password: z
    .string()
    .min(8, "validation.passwordMin")
    .regex(/[A-Z]/, "validation.passwordUppercase")
    .regex(/[a-z]/, "validation.passwordLowercase")
    .regex(/[0-9]/, "validation.passwordDigit")
    .regex(/[^A-Za-z0-9]/, "validation.passwordSpecial"),
  confirm_password: z.string().min(8, "validation.passwordMin"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "validation.passwordsMustMatch",
  path: ["confirm_password"],
});
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
