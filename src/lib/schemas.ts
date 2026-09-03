import { z } from "zod";

const MAX_TEXT = 50000;

export const citationStyleEnum = z.enum([
  "APA",
  "MLA",
  "Chicago",
  "Chicago-Notes",
  "Harvard",
  "IEEE",
  "BibTeX",
]);

export const humanizeSchema = z.object({
  text: z
    .string()
    .trim()
    .min(50, "Text must be at least 50 characters")
    .max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
  level: z.enum(["subtle", "balanced", "aggressive"]).optional().default("balanced"),
  grammarCheck: z.boolean().optional().default(false),
  mode: z.string().optional(),
});

export const enhanceSchema = z.object({
  text: z
    .string()
    .trim()
    .min(50, "Text must be at least 50 characters")
    .max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
  level: z.enum(["High School", "Undergraduate", "Masters", "Master's", "PhD"]),
});

export const plagiarismRiskSchema = z.object({
  text: z
    .string()
    .trim()
    .min(50, "Text must be at least 50 characters")
    .max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export const citationsSchema = z
  .object({
    source: z.string().trim().max(MAX_TEXT, "Source exceeds the 50,000 character limit").optional(),
    title: z.string().trim().max(MAX_TEXT, "Title exceeds the 50,000 character limit").optional(),
    author: z.string().trim().optional(),
    authors: z.union([z.string(), z.array(z.string()), z.array(z.record(z.string(), z.any()))]).optional(),
    year: z.union([z.string(), z.number()]).optional(),
    publisher: z.string().trim().optional(),
    journal: z.string().trim().optional(),
    volume: z.union([z.string(), z.number()]).optional(),
    issue: z.union([z.string(), z.number()]).optional(),
    pages: z.string().trim().optional(),
    url: z.string().trim().optional(),
    doi: z.string().trim().optional(),
    format: citationStyleEnum.optional(),
    style: citationStyleEnum.optional(),
  })
  .refine((data) => !!(data.source?.trim() || data.title?.trim()), {
    message: "Source or title is required",
  });

export const quizSchema = z.object({
  text: z
    .string()
    .trim()
    .min(50, "Text must be at least 50 characters")
    .max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export const syllabusSchema = z.object({
  text: z
    .string()
    .trim()
    .min(20, "Text must be at least 20 characters")
    .max(MAX_TEXT, "Text exceeds the 50,000 character limit"),
});

export type HumanizeInput = z.infer<typeof humanizeSchema>;
export type EnhanceInput = z.infer<typeof enhanceSchema>;
export type PlagiarismRiskInput = z.infer<typeof plagiarismRiskSchema>;
export type CitationsInput = z.infer<typeof citationsSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type SyllabusInput = z.infer<typeof syllabusSchema>;
