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
  mimeType: string
): Promise<GeminiMealAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const base64 = imageBuffer.toString("base64");

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text();
  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as GeminiMealAnalysis;
}

export async function nlpEditMeal(
  currentMeal: Record<string, unknown>,
  instruction: string
): Promise<Partial<GeminiMealAnalysis>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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

  return JSON.parse(jsonMatch[0]) as Partial<GeminiMealAnalysis>;
}
