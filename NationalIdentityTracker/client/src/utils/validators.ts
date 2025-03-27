import { z } from "zod";

// National number validation (2 letters followed by 10 digits)
export const nationalNumberSchema = z.string().regex(/^[A-Za-z]{2}\d{10}$/, {
  message: "National number must be 2 letters followed by 10 digits",
});

// Invoice number validation (10 digits)
export const invoiceNumberSchema = z.string().regex(/^\d{10}$/, {
  message: "Invoice number must be 10 digits",
});

// Password validation
export const passwordSchema = z.string().min(6, {
  message: "Password must be at least 6 characters",
});

// Email validation
export const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

// Phone number validation
export const phoneNumberSchema = z.string().min(10, {
  message: "Phone number must be at least 10 digits",
});
