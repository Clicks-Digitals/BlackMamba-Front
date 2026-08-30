import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "newsletter.validation.emailRequired")
    .email("newsletter.validation.emailInvalid")
});

export type NewsletterData = z.infer<typeof newsletterSchema>;
