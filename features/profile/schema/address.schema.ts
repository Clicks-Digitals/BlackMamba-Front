import { z } from "zod";

export const addressSchema = z.object({
  title: z.string().min(1, "validation.titleRequired").max(100, "validation.titleMax"),
  city: z.string().min(1, "validation.cityRequired").max(100, "validation.cityMax"),
  street: z.string().min(1, "validation.streetRequired").max(255, "validation.streetMax"),
  building: z.string().max(100, "validation.buildingMax").optional(),
  phone: z
    .string()
    .min(1, "validation.phoneRequired")
    .max(20, "validation.phoneMax")
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "validation.phoneInvalid"),
  is_default: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === "on" || val === "true" || val === true)
    .optional(),
});

export type AddressData = z.infer<typeof addressSchema>;
