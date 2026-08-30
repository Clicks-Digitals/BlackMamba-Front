import { z } from "zod";

/** Message strings are i18n keys under `Profile.ProfileInfoTab` (same pattern as `Auth.Login`). */
export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "validation.firstNameRequired"),
  last_name: z.string().trim().min(1, "validation.lastNameRequired"),
  username: z.string().trim().min(3, "validation.usernameMin"),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .email("validation.emailInvalid"),
  phone: z
    .string()
    .min(1, "validation.phoneRequired")
    .max(20, "validation.phoneMax")
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "validation.phoneInvalid"),
  address: z.string().trim().optional(),
  date_of_birth: z.string().trim().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;
