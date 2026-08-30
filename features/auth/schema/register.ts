import { z } from "zod";

export const registerSchema = z
  .object({
    f_name: z.string().trim().min(1, "validation.firstNameRequired"),
    l_name: z.string().trim().min(1, "validation.lastNameRequired"),
    email: z
      .string()
      .trim()
      .min(1, "validation.emailRequired")
      .email("validation.emailInvalid"),
    phone: z
      .string()
      .trim()
      .min(1, "validation.phoneRequired")
      .regex(/^07\d{8}$/, "validation.phoneInvalid"),
    password1: z
      .string()
      .min(8, "validation.passwordMin")
      .regex(/[A-Z]/, "validation.passwordUppercase")
      .regex(/[a-z]/, "validation.passwordLowercase")
      .regex(/[0-9]/, "validation.passwordDigit")
      .regex(/[^A-Za-z0-9]/, "validation.passwordSpecial"),
    password2: z.string().min(8, "validation.confirmPasswordMin"),
  })
  .refine((v) => v.password1 === v.password2, {
    message: "validation.passwordMismatch",
    path: ["password2"],
  });

export type RegisterData = z.infer<typeof registerSchema>;
