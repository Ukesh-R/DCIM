import { z } from "zod"

import { DEPARTMENTS } from "@/lib/constants"

export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.email("Enter a valid email address."),
  role: z.enum(["admin", "user"]),
  department: z.enum(DEPARTMENTS),
  jobTitle: z.string().min(1, "Job title is required."),
  phone: z.string().min(7, "Enter a valid phone number."),
  status: z.enum(["active", "inactive", "suspended"]),
  location: z.string().min(1, "Location is required."),
})

export type UserFormValues = z.infer<typeof userFormSchema>

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid phone number."),
  location: z.string().min(1, "Location is required."),
  jobTitle: z.string().min(1, "Job title is required."),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type PasswordFormValues = z.infer<typeof passwordFormSchema>
