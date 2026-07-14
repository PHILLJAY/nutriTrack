import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiMealAnalysis } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ANALYSIS_PROMPT = `Analyze this meal photo. Return ONLY a valid JSON object (no markdown, no code fences) with these exact fields:
{
  "name": "descriptive meal name",
  "calories": estimated_total_calories_as_number,
  "protein": grams_as_number,
  "carbs": grams_as_number,
  "fat": grams_as_number,
  "fiber": grams_as_number,
  "sugar": grams_as_number,
  "sodium": milligrams_as_number,
  "healthRating": 0_to_100_as_number,
  "mealType": "breakfast" or "lunch" or "dinner" or "snack",
  "notes": "brief description of what you see"
}

For healthRating (0-100): Rate based on balance of macros, fiber content, processed vs whole foods, sugar level, sodium level. 80+ = very healthy, 50-79 = moderate, below 50 = unhealthy.
Be realistic with portion estimates. If uncertain, estimate conservatively.`;

export async function analyzeMealImage(
  imageBuffer: Buffer,
  mimeType: string,
  userContext?: string
): Promise<GeminiMealAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const base64 = imageBuffer.toString("base64");

  const prompt = userContext
    ? `${ANALYSIS_PROMPT}\n\nAdditional context from the user: "${userContext}"\nUse this text to improve your analysis — it may describe ingredients, portion sizes, or preparation method that aren't visible in the photo.`
    : ANALYSIS_PROMPT;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  try {
    return JSON.parse(jsonMatch[0]) as GeminiMealAnalysis;
  } catch {
    throw new Error("Gemini returned malformed JSON");
  }
}

export async function nlpEditMeal(
  currentMeal: Record<string, unknown>,
  instruction: string
): Promise<Partial<GeminiMealAnalysis>> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const prompt = `You are a nutrition assistant. The user wants to edit their meal data.

Current meal data:
${JSON.stringify(currentMeal, null, 2)}

User instruction: "${instruction}"

Return ONLY a valid JSON object (no markdown, no code fences) with ONLY the fields that should be updated. 
For example, if the user says "the protein should be 35g", return: {"protein": 35}
If they say "I only ate half", halve all nutritional values.
If they say "add a side of rice", estimate and add the rice nutrition to the existing values.

Fields available: name, calories, protein, carbs, fat, fiber, sugar, sodium, healthRating, mealType, notes`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse NLP edit response");
  }

  try {
    return JSON.parse(jsonMatch[0]) as Partial<GeminiMealAnalysis>;
  } catch {
    throw new Error("Gemini returned malformed JSON for NLP edit");
  }
}

export async function analyzeMealDescription(
  description: string,
  mealType: string
): Promise<GeminiMealAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const prompt = `The user describes their meal as: "${description}"
Meal type: ${mealType}

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "name": "descriptive meal name",
  "calories": number,
  "protein": grams,
  "carbs": grams,
  "fat": grams,
  "fiber": grams,
  "sugar": grams,
  "sodium": mg,
  "healthRating": 0-100,
  "mealType": "${mealType}",
  "notes": "brief description"
}

Be realistic with estimates. Rate healthiness 0-100.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse response");

  try {
    return JSON.parse(jsonMatch[0]) as GeminiMealAnalysis;
  } catch {
    throw new Error("Gemini returned malformed JSON for meal description");
  }
}

export interface MealSuggestion {
  name: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  why: string;
}

export async function suggestMeals(remaining: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
  recentMeals?: string[];
}): Promise<MealSuggestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const recentContext = remaining.recentMeals?.length
    ? `\nRecent meals eaten today: ${remaining.recentMeals.join(", ")}`
    : "";

  const prompt = `Suggest 3 meal ideas for someone with these remaining daily macros:
- Calories: ${remaining.calories} kcal
- Protein: ${remaining.protein}g
- Carbs: ${remaining.carbs}g
- Fat: ${remaining.fat}g
- Goal: ${remaining.goal}${recentContext}

Return ONLY a valid JSON array (no markdown, no code fences):
[
  {
    "name": "meal name",
    "description": "brief description",
    "estimatedCalories": number,
    "estimatedProtein": grams,
    "estimatedCarbs": grams,
    "estimatedFat": grams,
    "why": "why this is a good choice for their remaining macros"
  }
]

Keep suggestions practical and realistic. Prioritize protein if they need more.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse suggestions");

  try {
    return JSON.parse(jsonMatch[0]) as MealSuggestion[];
  } catch {
    throw new Error("Gemini returned malformed JSON for suggestions");
  }
}
