"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { MealData } from "@/types";

interface MacroEditorProps {
  meal: MealData;
  onSave: (updates: Partial<MealData>) => Promise<void>;
  onCancel: () => void;
}

export function MacroEditor({ meal, onSave, onCancel }: MacroEditorProps) {
  const [form, setForm] = useState({
    name: meal.name,
    calories: meal.calories.toString(),
    protein: meal.protein.toString(),
    carbs: meal.carbs.toString(),
    fat: meal.fat.toString(),
    fiber: (meal.fiber ?? "").toString(),
    sugar: (meal.sugar ?? "").toString(),
    sodium: (meal.sodium ?? "").toString(),
    mealType: meal.mealType,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        calories: parseInt(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
        fiber: form.fiber ? parseFloat(form.fiber) : undefined,
        sugar: form.sugar ? parseFloat(form.sugar) : undefined,
        sodium: form.sodium ? parseFloat(form.sodium) : undefined,
        mealType: form.mealType,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Meal Name</Label>
        <Input
          id="edit-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-calories">Calories</Label>
          <Input
            id="edit-calories"
            type="number"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-type">Meal Type</Label>
          <select
            id="edit-type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value })}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-protein">Protein (g)</Label>
          <Input
            id="edit-protein"
            type="number"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-carbs">Carbs (g)</Label>
          <Input
            id="edit-carbs"
            type="number"
            value={form.carbs}
            onChange={(e) => setForm({ ...form, carbs: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-fat">Fat (g)</Label>
          <Input
            id="edit-fat"
            type="number"
            value={form.fat}
            onChange={(e) => setForm({ ...form, fat: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-fiber">Fiber (g)</Label>
          <Input
            id="edit-fiber"
            type="number"
            value={form.fiber}
            onChange={(e) => setForm({ ...form, fiber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-sugar">Sugar (g)</Label>
          <Input
            id="edit-sugar"
            type="number"
            value={form.sugar}
            onChange={(e) => setForm({ ...form, sugar: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-sodium">Sodium (mg)</Label>
          <Input
            id="edit-sodium"
            type="number"
            value={form.sodium}
            onChange={(e) => setForm({ ...form, sodium: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
