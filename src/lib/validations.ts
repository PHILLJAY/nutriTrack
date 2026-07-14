import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(10).max(120),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export const mealCreateSchema = z.object({
  name: z.string().min(1).max(200),
  calories: z.number().int().min(0).max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200).optional(),
  sugar: z.number().min(0).max(500).optional(),
  sodium: z.number().min(0).max(50000).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  notes: z.string().max(500).optional(),
  eatenAt: z.string().optional(),
  imageId: z.string().optional(),
});

export const mealUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  calories: z.number().int().min(0).max(10000).optional(),
  protein: z.number().min(0).max(500).optional(),
  carbs: z.number().min(0).max(500).optional(),
  fat: z.number().min(0).max(500).optional(),
  fiber: z.number().min(0).max(200).nullable().optional(),
  sugar: z.number().min(0).max(500).nullable().optional(),
  sodium: z.number().min(0).max(50000).nullable().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  notes: z.string().max(500).nullable().optional(),
  eatenAt: z.string().optional(),
});

export const nlpEditSchema = z.object({
  mealId: z.string().min(1),
  instruction: z.string().min(1).max(500),
});

export const discordLinkSchema = z.object({
  discordId: z.string().regex(/^\d{17,20}$/, "Invalid Discord ID"),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(10).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  goal: z.enum(["lose", "maintain", "gain"]).optional(),
});
