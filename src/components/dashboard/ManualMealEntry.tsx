"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UtensilsCrossed } from "lucide-react";

interface ManualMealEntryProps {
  onSuccess: () => void;
}

export function ManualMealEntry({ onSuccess }: ManualMealEntryProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meals/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, mealType }),
      });

      if (res.ok) {
        setDescription("");
        setOpen(false);
        onSuccess();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to analyze meal");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" />
        }
      >
        <UtensilsCrossed className="h-4 w-4 mr-1" />
        Quick Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a Meal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">What did you eat?</label>
            <Textarea
              placeholder="e.g. 2 eggs with toast and avocado, a bowl of chicken rice, a protein shake..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Meal Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
            className="w-full"
          >
            {loading ? "Analyzing..." : "Log Meal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
