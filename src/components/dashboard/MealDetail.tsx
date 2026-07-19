"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { MealDetailContent } from "./MealDetailContent";
import type { MealData } from "@/types";

interface MealDetailProps {
  meal: MealData | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function MealDetail({ meal, open, onClose, onUpdate }: MealDetailProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [editing, setEditing] = useState(false);
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
      toast.success("Template saved");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSave = async (updates: Partial<MealData>) => {
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setEditing(false);
        onUpdate();
        toast.success("Meal updated");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save changes");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this meal?")) return;
    const deletedMeal = { ...meal };
    onClose();
    onUpdate();

    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Meal deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              await fetch("/api/meals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: deletedMeal.name,
                  calories: deletedMeal.calories,
                  protein: deletedMeal.protein,
                  carbs: deletedMeal.carbs,
                  fat: deletedMeal.fat,
                  fiber: deletedMeal.fiber,
                  sugar: deletedMeal.sugar,
                  sodium: deletedMeal.sodium,
                  mealType: deletedMeal.mealType,
                  notes: deletedMeal.notes,
                  eatenAt: deletedMeal.eatenAt,
                  imageId: deletedMeal.imageId,
                }),
              });
              onUpdate();
              toast.success("Meal restored");
            },
          },
        });
      } else {
        toast.error("Failed to delete meal");
        onUpdate();
      }
    } catch {
      toast.error("Network error. Please try again.");
      onUpdate();
    }
  };

  const contentProps = {
    meal,
    editing,
    setEditing,
    savingTemplate,
    handleSaveAsTemplate,
    handleSave,
    handleDelete,
    onUpdate,
    onClose,
  };

  return (
    <>
      {/* Desktop Panel with click-outside backdrop */}
      {open && !isMobile && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-40 translate-x-0">
            <div className="h-full overflow-y-auto">
              <MealDetailContent {...contentProps} />
            </div>
          </div>
        </>
      )}

      {/* Mobile Sheet */}
      {isMobile && (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
          <SheetContent className="overflow-y-auto w-full sm:max-w-lg p-0" showCloseButton={false}>
            <MealDetailContent {...contentProps} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
