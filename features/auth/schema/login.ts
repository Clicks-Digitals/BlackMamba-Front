import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "validation.emailRequired").email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMin"),
});

export type LoginData = z.infer<typeof loginSchema>;
