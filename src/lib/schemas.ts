import { z } from "zod";

const MAX_TEXT = 50000;

export const humanizeSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters").max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
  level: z.enum(["subtle", "balanced", "aggressive"]).optional().default("balanced"),
  grammarCheck: z.boolean().optional().default(false),
  mode: z.string().optional(),
});

export const enhanceSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters").max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
  level: z.enum(["High School", "Undergraduate", "Masters", "PhD"]),
});

export const plagiarismRiskSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters").max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export const citationsSchema = z.object({
  source: z.string().trim().min(1, "Source is required").max(MAX_TEXT, "Source exceeds the 50,000 character limit"),
  format: z.enum(["APA", "MLA", "Chicago", "Harvard"]).optional().default("APA"),
});

export const quizSchema = z.object({
  text: z.string().trim().min(50, "Text must be at least 50 characters").max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export const syllabusSchema = z.object({
  text: z.string().trim().min(20, "Text must be at least 20 characters").max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export type HumanizeInput = z.infer<typeof humanizeSchema>;
export type EnhanceInput = z.infer<typeof enhanceSchema>;
export type PlagiarismRiskInput = z.infer<typeof plagiarismRiskSchema>;
export type CitationsInput = z.infer<typeof citationsSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type SyllabusInput = z.infer<typeof syllabusSchema>;
