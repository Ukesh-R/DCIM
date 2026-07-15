import { z } from "zod"

export const requestFormSchema = z.object({
  targetType: z.enum(["cluster", "asset"]),
  title: z.string().min(4, "Title is required."),
  justification: z.string().min(10, "Please provide more detail (min 10 characters)."),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  requestedSpecs: z.string().min(2, "Requested specs are required."),
  customerName: z.string().optional(),
})

export type RequestFormValues = z.infer<typeof requestFormSchema>

export const decisionFormSchema = z.object({
  decisionNote: z.string().min(4, "Please provide a short note (min 4 characters)."),
})

export type DecisionFormValues = z.infer<typeof decisionFormSchema>
