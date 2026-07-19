import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { analyzeMealImage } from "@/lib/gemini";
import { saveImage } from "@/lib/image-store";
import { calculateHealthRating } from "@/lib/health-rating";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit(userId, "meals/analyze");
  if (!allowed) {
    return Response.json(
      { error: `Rate limit exceeded. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("image") as File[];

  if (files.length === 0) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: `File too large: ${file.name}. Maximum size: 10MB` },
        { status: 400 }
      );
    }
  }

  const meals = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { filename, path, buffer: storedBuffer, mimeType: storedMime } = await saveImage(buffer, file.name, file.type);

    const image = await prisma.image.create({
      data: {
        userId,
        filename,
        path,
        mimeType: storedMime,
        size: storedBuffer.length,
      },
    });

    try {
      const analysis = await analyzeMealImage(buffer, file.type);
      const healthRating = calculateHealthRating(analysis);

      const meal = await prisma.meal.create({
        data: {
          userId,
          name: analysis.name,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          fiber: analysis.fiber,
          sugar: analysis.sugar,
          sodium: analysis.sodium,
          vitaminA: analysis.vitaminA_mcg ?? null,
          vitaminC: analysis.vitaminC_mg ?? null,
          vitaminD: analysis.vitaminD_mcg ?? null,
          calcium: analysis.calcium_mg ?? null,
          iron: analysis.iron_mg ?? null,
          healthRating,
          mealType: analysis.mealType,
          eatenAt: new Date(),
          notes: analysis.notes,
          source: "web",
          imageId: image.id,
        },
        include: { image: true },
      });

      meals.push(meal);
    } catch {
      await prisma.image.delete({ where: { id: image.id } });
    }
  }

  if (meals.length === 0) {
    return Response.json(
      { error: "Failed to analyze all meal images" },
      { status: 500 }
    );
  }

  return Response.json({ meals, count: meals.length });
}
