import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTargets } from "@/lib/nutrition";
import { setSession } from "@/lib/session";
import type { OnboardingData } from "@/types";

export async function POST(request: NextRequest) {
  const data: OnboardingData = await request.json();

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
      ...targets,
    },
  });

  await setSession(user.id);

  return Response.json({ user, targets });
}
