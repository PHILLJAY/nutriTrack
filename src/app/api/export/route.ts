import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { eatenAt: "asc" },
    include: { image: { select: { path: true } } },
  });

  const rows = meals.map((m) => ({
    date: m.eatenAt.toISOString(),
    name: m.name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    fiber: m.fiber,
    sugar: m.sugar,
    sodium: m.sodium,
    healthRating: m.healthRating,
    mealType: m.mealType,
    notes: m.notes,
    source: m.source,
    imageUrl: m.image?.path || "",
  }));

  if (format === "json") {
    return new Response(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=nutritrack-meals.json",
      },
    });
  }

  // CSV format
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h as keyof typeof row];
          const str = val === null || val === undefined ? "" : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=nutritrack-meals.csv",
    },
  });
}
