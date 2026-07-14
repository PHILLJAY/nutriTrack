"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBasics } from "@/components/onboarding/StepBasics";
import { StepActivity } from "@/components/onboarding/StepActivity";
import { StepGoals } from "@/components/onboarding/StepGoals";
import { StepSummary } from "@/components/onboarding/StepSummary";

const STEPS = ["basics", "activity", "goals", "summary"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [targets, setTargets] = useState<{
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  } | null>(null);

  const updateData = (partial: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const canProceed = () => {
    switch (STEPS[step]) {
      case "basics":
        return data.name && data.age && data.gender && data.height && data.weight;
      case "activity":
        return data.activityLevel;
      case "goals":
        return data.goal;
      case "summary":
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          age: parseInt(data.age),
          gender: data.gender,
          height: parseFloat(data.height),
          weight: parseFloat(data.weight),
          activityLevel: data.activityLevel,
          goal: data.goal,
          timezone: data.timezone,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setTargets(result.targets);
        router.push("/dashboard");
      } else {
        const err = await res.json();
        setError(err.error || "Something went wrong. Please check your inputs.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <div className="wordmark text-2xl font-bold text-lime">NutriTrack</div>
          <div className="eyebrow mt-1">N.{String(step + 1).padStart(3, "0")} — {STEPS[step]}</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-lime" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="glass-panel rounded-2xl p-6 mb-8">
          {STEPS[step] === "basics" && (
            <StepBasics data={data} onChange={updateData} />
          )}
          {STEPS[step] === "activity" && (
            <StepActivity
              value={data.activityLevel}
              onChange={(v) => updateData({ activityLevel: v })}
            />
          )}
          {STEPS[step] === "goals" && (
            <StepGoals
              value={data.goal}
              onChange={(v) => updateData({ goal: v })}
            />
          )}
          {STEPS[step] === "summary" && (
            <StepSummary data={data} targets={targets} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1"
          >
            {loading
              ? "Creating your plan..."
              : step === STEPS.length - 1
              ? "Get Started"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
