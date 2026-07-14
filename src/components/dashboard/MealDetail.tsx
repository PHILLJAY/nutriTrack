"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2, Bookmark } from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { MacroEditor } from "./MacroEditor";
import { NLPEditInput } from "./NLPEditInput";
import type { MealData } from "@/types";

interface MealDetailProps {
  meal: MealData;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealDetail({ meal, open, onClose, onUpdate }: MealDetailProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleSaveAsTemplate = async () => {
    setSavingTemplate(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
          sugar: meal.sugar,
          sodium: meal.sodium,
          mealType: meal.mealType,
          notes: meal.notes,
        }),
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSave = async (updates: Partial<MealData>) => {
    setError("");
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setEditing(false);
        onUpdate();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to save changes");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this meal?")) return;
    setError("");
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      if (res.ok) {
        onClose();
        onUpdate();
      } else {
        setError("Failed to delete meal");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg p-0">
        {/* Image — full bleed at top */}
        {meal.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}

        <div className="px-6 pb-8 relative">
          {/* Header */}
          <div className="pt-6">
            <h2 className="text-xl font-bold leading-snug">{meal.name}</h2>
            <div className="flex items-center gap-2 mt-2.5">
              <Badge variant="secondary" className="text-xs font-medium">
                {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
              </Badge>
              <Badge variant="outline" className="text-xs font-medium">
                {meal.source}
              </Badge>
            </div>
          </div>

          {/* Action bar */}
          {!editing && (
            <div className="flex items-center gap-1 mt-4 -mx-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleSaveAsTemplate}
                disabled={savingTemplate}
              >
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                Save template
              </Button>
              <div className="w-px h-4 bg-border/60 mx-1" />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <div className="w-px h-4 bg-border/60 mx-1" />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError("")} className="ml-2 font-bold">&times;</button>
            </div>
          )}

          {editing ? (
            <div className="mt-6">
              <MacroEditor
                meal={meal}
                onSave={handleSave}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {/* Health Rating & Calories Row */}
              <div className="flex items-center gap-5">
                <HealthBadge rating={meal.healthRating} size="lg" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Health Rating
                  </div>
                  <div className="font-semibold">
                    {meal.healthRating >= 80
                      ? "Very Healthy"
                      : meal.healthRating >= 50
                      ? "Moderate"
                      : "Unhealthy"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-lime leading-none">
                    {meal.calories}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">calories</div>
                </div>
              </div>

              {/* Macros */}
              <div className="space-y-3.5">
                <MacroBar
                  label="Protein"
                  value={meal.protein}
                  max={100}
                  color="bg-lavender"
                  unit="g"
                />
                <MacroBar
                  label="Carbs"
                  value={meal.carbs}
                  max={150}
                  color="bg-[#7fd8c4]"
                  unit="g"
                />
                <MacroBar
                  label="Fat"
                  value={meal.fat}
                  max={80}
                  color="bg-[#f2b45c]"
                  unit="g"
                />
              </div>

              {/* Additional Info */}
              {(meal.fiber != null || meal.sugar != null || meal.sodium != null) && (
                <div className="grid grid-cols-3 gap-3">
                  {meal.fiber != null && (
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <div className="text-lg font-semibold">{meal.fiber}g</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Fiber</div>
                    </div>
                  )}
                  {meal.sugar != null && (
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <div className="text-lg font-semibold">{meal.sugar}g</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Sugar</div>
                    </div>
                  )}
                  {meal.sodium != null && (
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <div className="text-lg font-semibold">{meal.sodium}mg</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Sodium</div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {meal.notes && (
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {meal.notes}
                  </p>
                </div>
              )}

              {/* NLP Edit */}
              <div className="pt-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Edit with natural language
                </div>
                <NLPEditInput mealId={meal.id} onUpdate={onUpdate} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MacroBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
