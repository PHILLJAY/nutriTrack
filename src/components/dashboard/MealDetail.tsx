"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { MealDetailContent } from "./MealDetailContent";
import type { MealData } from "@/types";

interface MealDetailProps {
  meal: MealData | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function MealDetail({ meal, open, onClose, onUpdate }: MealDetailProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  if (!meal) return null;

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

  const contentProps = {
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
  };

  return (
    <>
      {/* Desktop Panel */}
      {open && (
        <div className="hidden md:block fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-40 translate-x-0">
          <div className="h-full overflow-y-auto">
            <MealDetailContent {...contentProps} />
          </div>
        </div>
      )}

      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
          <SheetContent className="overflow-y-auto w-full sm:max-w-lg p-0">
            <MealDetailContent {...contentProps} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
