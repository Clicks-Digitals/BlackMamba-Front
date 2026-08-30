import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().min(1, "validation.nameRequired").max(255),
phone: z
      .string()
      .trim()
      .min(1, "validation.phoneRequired")
      .regex(/^\+?[1-9]\d{6,14}$/, "validation.phoneInvalid"),
  location: z.string().min(1, "validation.locationRequired").max(255),
  email: z.email("validation.emailInvalid").max(254),
  subject: z.string().min(1, "validation.subjectRequired").max(500),
  message: z.string().min(1, "validation.messageRequired"),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
