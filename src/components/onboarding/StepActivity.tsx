"use client";

import { cn } from "@/lib/utils";

interface StepActivityProps {
  value: string;
  onChange: (value: string) => void;
}

const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little or no exercise, desk job",
  },
  {
    value: "light",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    value: "moderate",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    value: "active",
    label: "Active",
    description: "Hard exercise 6-7 days/week",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Athlete, physical job, or twice daily training",
  },
];

export function StepActivity({ value, onChange }: StepActivityProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Level</h2>
        <p className="text-muted-foreground">
          How active are you on a typical week?
        </p>
      </div>

      <div className="space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              value === level.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="font-medium">{level.label}</div>
            <div className="text-sm text-muted-foreground">
              {level.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
