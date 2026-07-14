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
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{meal.name}</span>
            <div className="flex gap-2">
              {!editing && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveAsTemplate}
                    disabled={savingTemplate}
                    title="Save as template"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError("")} className="ml-2 font-bold">&times;</button>
            </div>
          )}

          {/* Image */}
          {meal.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={meal.imageUrl}
                alt={meal.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {editing ? (
            <MacroEditor
              meal={meal}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {/* Health Rating */}
              <div className="flex items-center gap-4">
                <HealthBadge rating={meal.healthRating} size="lg" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Health Rating
                  </div>
                  <div className="font-medium">
                    {meal.healthRating >= 80
                      ? "Very Healthy"
                      : meal.healthRating >= 50
                      ? "Moderate"
                      : "Unhealthy"}
                  </div>
                </div>
              </div>

              {/* Meal Info */}
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
                </Badge>
                <Badge variant="outline">{meal.source}</Badge>
              </div>

              {/* Calories */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-orange-500">
                  {meal.calories}
                </div>
                <div className="text-sm text-muted-foreground">calories</div>
              </div>

              {/* Macros */}
              <div className="space-y-3">
                <MacroBar
                  label="Protein"
                  value={meal.protein}
                  max={100}
                  color="bg-red-500"
                  unit="g"
                />
                <MacroBar
                  label="Carbs"
                  value={meal.carbs}
                  max={150}
                  color="bg-blue-500"
                  unit="g"
                />
                <MacroBar
                  label="Fat"
                  value={meal.fat}
                  max={80}
                  color="bg-yellow-500"
                  unit="g"
                />
              </div>

              {/* Additional Info */}
              {(meal.fiber || meal.sugar || meal.sodium) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {meal.fiber != null && (
                      <div>
                        <div className="font-semibold">{meal.fiber}g</div>
                        <div className="text-xs text-muted-foreground">
                          Fiber
                        </div>
                      </div>
                    )}
                    {meal.sugar != null && (
                      <div>
                        <div className="font-semibold">{meal.sugar}g</div>
                        <div className="text-xs text-muted-foreground">
                          Sugar
                        </div>
                      </div>
                    )}
                    {meal.sodium != null && (
                      <div>
                        <div className="font-semibold">{meal.sodium}mg</div>
                        <div className="text-xs text-muted-foreground">
                          Sodium
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              {meal.notes && (
                <div className="text-sm text-muted-foreground italic">
                  {meal.notes}
                </div>
              )}

              {/* NLP Edit */}
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">
                  Edit with natural language
                </div>
                <NLPEditInput mealId={meal.id} onUpdate={onUpdate} />
              </div>
            </>
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
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
