"use client";

import { cn } from "@/lib/utils";

interface StepGoalsProps {
  value: string;
  onChange: (value: string) => void;
}

const GOALS = [
  {
    value: "lose",
    label: "Lose Weight",
    description: "500 calorie daily deficit for ~0.5kg/week loss",
    icon: "📉",
  },
  {
    value: "maintain",
    label: "Maintain Weight",
    description: "Stay at your current weight while eating healthy",
    icon: "⚖️",
  },
  {
    value: "gain",
    label: "Gain Weight",
    description: "300 calorie daily surplus for lean muscle gain",
    icon: "📈",
  },
];

export function StepGoals({ value, onChange }: StepGoalsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Goal</h2>
        <p className="text-muted-foreground">
          What do you want to achieve?
        </p>
      </div>

      <div className="grid gap-4">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onChange(goal.value)}
            className={cn(
              "text-left p-6 rounded-lg border-2 transition-all",
              value === goal.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{goal.icon}</span>
              <div>
                <div className="font-semibold text-lg">{goal.label}</div>
                <div className="text-sm text-muted-foreground">
                  {goal.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
