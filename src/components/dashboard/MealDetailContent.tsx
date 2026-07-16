import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Bookmark, X } from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { MacroEditor } from "./MacroEditor";
import { NLPEditInput } from "./NLPEditInput";
import type { MealData } from "@/types";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

interface MealDetailContentProps {
  meal: MealData;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  error: string;
  setError: (error: string) => void;
  savingTemplate: boolean;
  handleSaveAsTemplate: () => void;
  handleSave: (updates: Partial<MealData>) => void;
  handleDelete: () => void;
  onUpdate: () => void;
  onClose: () => void;
}

export function MealDetailContent({
  meal,
  editing,
  setEditing,
  error,
  setError,
  savingTemplate,
  handleSaveAsTemplate,
  handleSave,
  handleDelete,
  onUpdate,
  onClose,
}: MealDetailContentProps) {
  return (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

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
        <div className="pt-6">
          <h2 className="text-xl font-bold leading-snug break-words">{meal.name}</h2>
          <div className="flex items-center gap-2 mt-2.5">
            <Badge variant="secondary" className="text-xs font-medium">
              {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium">
              {meal.source}
            </Badge>
          </div>
        </div>

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
              onSave={async (updates) => await handleSave(updates)}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
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

            {meal.notes && (
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-sm text-muted-foreground italic leading-relaxed break-words">
                  {meal.notes}
                </p>
              </div>
            )}

            <div className="pt-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Edit with natural language
              </div>
              <NLPEditInput mealId={meal.id} onUpdate={onUpdate} />
            </div>
          </div>
        )}
      </div>
    </>
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
