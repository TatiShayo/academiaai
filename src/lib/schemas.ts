import { z } from "zod";

export const humanizeSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters"),
  level: z.enum(["subtle", "balanced", "aggressive"]).optional().default("balanced"),
  grammarCheck: z.boolean().optional().default(false),
  mode: z.string().optional(),
});

export const enhanceSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters"),
  level: z.enum(["High School", "Undergraduate", "Masters", "PhD"]),
});

export const plagiarismRiskSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters"),
});

export const citationsSchema = z.object({
  source: z.string().trim().min(1, "Source is required"),
  format: z.enum(["APA", "MLA", "Chicago", "Harvard"]).optional().default("APA"),
});

export type HumanizeInput = z.infer<typeof humanizeSchema>;
export type EnhanceInput = z.infer<typeof enhanceSchema>;
export type PlagiarismRiskInput = z.infer<typeof plagiarismRiskSchema>;
export type CitationsInput = z.infer<typeof citationsSchema>;
