import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTargets } from "@/lib/nutrition";
import { setSession } from "@/lib/session";
import { onboardingSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const targets = calculateTargets(data);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activityLevel: data.activityLevel,
      goal: data.goal,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...targets,
    },
  });

  await setSession(user.id);

  return Response.json({ user, targets });
}
