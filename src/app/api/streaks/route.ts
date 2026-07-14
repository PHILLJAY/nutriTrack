import { getSession } from "@/lib/session";
import { calculateStreak } from "@/lib/streaks";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const streak = await calculateStreak(userId);
  return Response.json(streak);
}
