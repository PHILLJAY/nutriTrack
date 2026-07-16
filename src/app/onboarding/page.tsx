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
  const [mode, setMode] = useState<"new" | "login">("new");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginName, setLoginName] = useState("");
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

  const handleLogin = async () => {
    if (!loginName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName.trim() }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err = await res.json();
        setError(err.error || "Account not found");
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
          <div className="eyebrow mt-1">
            {mode === "login" ? "Welcome back" : `N.${String(step + 1).padStart(3, "0")} — ${STEPS[step]}`}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setMode("new"); setError(""); }}
            className={`flex-1 h-10 rounded-full text-sm font-medium transition-colors ${
              mode === "new" ? "bg-lime text-lime-foreground" : "bg-white/[0.08] text-muted-foreground hover:bg-white/[0.12]"
            }`}
          >
            New User
          </button>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 h-10 rounded-full text-sm font-medium transition-colors ${
              mode === "login" ? "bg-lime text-lime-foreground" : "bg-white/[0.08] text-muted-foreground hover:bg-white/[0.12]"
            }`}
          >
            I already have an account
          </button>
        </div>

        {mode === "login" ? (
          <>
            {/* Login form */}
            <div className="glass-panel rounded-2xl p-6 mb-8">
              <label className="block text-sm font-medium mb-2">Your name</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter the name you signed up with"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-lime/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the name you used when you first set up NutriTrack on your other device.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Login button */}
            <Button
              onClick={handleLogin}
              disabled={!loginName.trim() || loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
