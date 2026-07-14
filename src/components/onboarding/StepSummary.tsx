"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StepSummaryProps {
  data: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    activityLevel: string;
    goal: string;
  };
  targets: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  } | null;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  active: "Active",
  very_active: "Very Active",
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose Weight",
  maintain: "Maintain Weight",
  gain: "Gain Weight",
};

export function StepSummary({ data, targets }: StepSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Plan</h2>
        <p className="text-muted-foreground">
          Here&apos;s your personalized nutrition plan based on your info.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Age</span>
              <p className="font-medium">{data.age}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gender</span>
              <p className="font-medium capitalize">{data.gender}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Height</span>
              <p className="font-medium">{data.height} cm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Weight</span>
              <p className="font-medium">{data.weight} kg</p>
            </div>
            <div>
              <span className="text-muted-foreground">Activity</span>
              <p className="font-medium">
                {ACTIVITY_LABELS[data.activityLevel] || data.activityLevel}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Goal</span>
              <p className="font-medium">
                {GOAL_LABELS[data.goal] || data.goal}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {targets && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-full bg-lime px-4 py-3 text-center text-lime-foreground">
            <div className="text-2xl font-bold leading-tight">{targets.targetCalories}</div>
            <div className="eyebrow !text-lime-foreground/70">Calories/day</div>
          </div>
          <div className="rounded-full bg-lavender px-4 py-3 text-center text-lavender-foreground">
            <div className="text-2xl font-bold leading-tight">{targets.targetProtein}g</div>
            <div className="eyebrow !text-lavender-foreground/70">Protein</div>
          </div>
          <div className="rounded-full bg-paper px-4 py-3 text-center text-paper-foreground">
            <div className="text-2xl font-bold leading-tight">{targets.targetCarbs}g</div>
            <div className="eyebrow !text-paper-foreground/70">Carbs</div>
          </div>
          <div className="rounded-full bg-ink px-4 py-3 text-center text-ink-foreground border border-white/10">
            <div className="text-2xl font-bold leading-tight">{targets.targetFat}g</div>
            <div className="eyebrow !text-ink-foreground/60">Fat</div>
          </div>
        </div>
      )}
    </div>
  );
}
