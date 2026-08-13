import { z } from "zod";

const nameField = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(60, "That name is too long");

const emailField = z.string().trim().email("Enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number");

/* ---------------- Buy Policy wizard ---------------- */
export const personalInfoSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  address: z.string().trim().min(8, "Please enter your full address").max(160),
});
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

export const nomineeSchema = z.object({
  nomineeName: nameField,
  nomineeRelation: z.string().trim().min(2, "Please specify the relationship"),
  nomineeAge: z.coerce
    .number({ invalid_type_error: "Enter a valid age" })
    .int("Age must be a whole number")
    .min(1, "Enter a valid age")
    .max(120, "Enter a valid age"),
});
export type Nominee = z.infer<typeof nomineeSchema>;

export const paymentSchema = z.object({
  cardName: nameField,
  cardNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\d{16}$/, "Card number must be 16 digits")),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format")
    .refine((v) => {
      const [mm, yy] = v.split("/").map(Number);
      const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
      return exp.getTime() >= Date.now();
    }, "Card has expired"),
  cvv: z.string().trim().regex(/^\d{3}$/, "CVV must be 3 digits"),
});
export type PaymentInfo = z.infer<typeof paymentSchema>;

/* ---------------- Claims ---------------- */
export const claimSchema = z.object({
  policyNumber: z
    .string()
    .trim()
    .regex(/^POL-\d{4}-\d{5}$/i, "Format: POL-2026-00001"),
  customerName: nameField,
  incidentDate: z
    .string()
    .min(1, "Select the incident date")
    .refine((v) => new Date(v).getTime() <= Date.now(), "Incident date cannot be in the future"),
  claimType: z.string().min(1, "Select a claim type"),
  amount: z.coerce
    .number({ invalid_type_error: "Enter the claim amount" })
    .min(1, "Enter a valid amount")
    .max(100000000, "Amount exceeds policy limits"),
  description: z.string().trim().min(15, "Please describe the incident (min 15 chars)").max(600),
  documentName: z.string().optional().default(""),
});
export type ClaimInput = z.infer<typeof claimSchema>;

/* ---------------- Contact ---------------- */
export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: z.string().trim().min(3, "Enter a subject").max(80),
  message: z.string().trim().min(20, "Please write at least 20 characters").max(1000),
});
export type ContactInput = z.infer<typeof contactSchema>;

/* ---------------- Buy request (server) ---------------- */
export const buySchema = z.object({
  planId: z.string().min(1),
  term: z.coerce.number().min(1).max(40),
  personal: personalInfoSchema,
  nominee: nomineeSchema,
  amount: z.coerce.number().min(1),
  last4: z.string().regex(/^\d{4}$/),
  method: z.string().min(1),
});
export type BuyInput = z.infer<typeof buySchema>;

/* ---------------- Dashboard login ---------------- */
export const loginSchema = z.object({
  email: emailField,
});
