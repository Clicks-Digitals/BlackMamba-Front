import { z } from "zod";

/** Message values are i18n keys under `Profile.SupportTab` (same pattern as `Auth.Login`). */
export const createSupportTicketSchema = z.object({
  subject: z.string().min(1, "validation.subjectRequired").max(255, "validation.subjectMax"),
  category: z.enum(["ORDER_ISSUE", "PAYMENT", "SHIPPING", "GENERAL"], {
    message: "validation.categoryRequired",
  }),
  body: z.string().min(1, "validation.messageRequired"),
  order: z.string().optional().or(z.literal("")),
  guest_email: z.email("validation.guestEmailInvalid").optional().or(z.literal("")),
});

export type CreateSupportTicketValues = z.infer<typeof createSupportTicketSchema>;

export const createSupportReplySchema = z.object({
  body: z.string().min(1, "validation.messageRequired"),
  attachment: z.string().optional().or(z.literal("")),
});

export type CreateSupportReplyValues = z.infer<typeof createSupportReplySchema>;
