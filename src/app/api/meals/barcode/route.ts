import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

interface OpenFoodFactsProduct {
  product_name: string;
  nutriments: {
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  nutriments_per?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const barcode = body.barcode?.trim();

  if (!barcode) {
    return Response.json({ error: "Barcode is required" }, { status: 400 });
  }

  // Query Open Food Facts API (free, no API key needed)
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "NutriTrack/1.0 (contact@nutritrack.app)" },
  });

  if (!res.ok) {
    return Response.json(
      { error: "Failed to look up barcode" },
      { status: 502 }
    );
  }

  const data: OpenFoodFactsResponse = await res.json();

  if (data.status !== 1 || !data.product) {
    return Response.json(
      { error: "Product not found for this barcode" },
      { status: 404 }
    );
  }

  const product = data.product;
  const n = product.nutriments;

  // Determine serving multiplier
  // Open Food Facts provides per-100g by default
  // If serving_size is available, we try to parse it
  let servingMultiplier = 1;
  if (product.serving_size) {
    const match = product.serving_size.match(/([\d.]+)\s*(g|ml)/i);
    if (match) {
      servingMultiplier = parseFloat(match[1]) / 100;
    }
  }

  const calories = Math.round((n.energy_kcal_100g || 0) * servingMultiplier);
  const protein = Math.round((n.proteins_100g || 0) * servingMultiplier);
  const carbs = Math.round((n.carbohydrates_100g || 0) * servingMultiplier);
  const fat = Math.round((n.fat_100g || 0) * servingMultiplier);
  const fiber = Math.round((n.fiber_100g || 0) * servingMultiplier);
  const sugar = Math.round((n.sugars_100g || 0) * servingMultiplier);
  const sodium = Math.round((n.sodium_100g || 0) * servingMultiplier * 1000); // convert g to mg

  // Create the meal
  const meal = await prisma.meal.create({
    data: {
      userId,
      name: product.product_name || "Scanned Food",
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      healthRating: 50, // neutral default for scanned foods
      mealType: "snack",
      source: "barcode",
      notes: `Barcode: ${barcode}${product.serving_size ? ` | Serving: ${product.serving_size}` : ""}`,
      eatenAt: new Date(),
    },
  });

  return Response.json({
    meal,
    product: {
      name: product.product_name,
      servingSize: product.serving_size,
    },
  });
}