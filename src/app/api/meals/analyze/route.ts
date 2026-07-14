import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { analyzeMealImage } from "@/lib/gemini";
import { saveImage } from "@/lib/image-store";
import { calculateHealthRating } from "@/lib/health-rating";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File;
  if (!file) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size: 10MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { filename, path } = await saveImage(buffer, file.name, file.type);

  // Save image record
  const image = await prisma.image.create({
    data: {
      userId,
      filename,
      path,
      mimeType: file.type,
      size: buffer.length,
    },
  });

  try {
    // Analyze with Gemini
    const analysis = await analyzeMealImage(buffer, file.type);
    const healthRating = calculateHealthRating(analysis);

    // Create meal
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
        healthRating,
        mealType: analysis.mealType,
        eatenAt: new Date(),
        notes: analysis.notes,
        source: "web",
        imageId: image.id,
      },
      include: { image: true },
    });

    return Response.json({ meal, analysis });
  } catch {
    // Clean up orphaned image on failure
    await prisma.image.delete({ where: { id: image.id } });
    return Response.json(
      { error: "Failed to analyze meal image" },
      { status: 500 }
    );
  }
}
