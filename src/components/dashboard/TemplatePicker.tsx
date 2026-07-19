"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bookmark, Trash2, Star } from "lucide-react";

interface Template {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  isFavorite: boolean;
}

interface TemplatePickerProps {
  onSelect: (template: Template) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchTemplates();
  }, [open]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = async (id: string) => {
    const res = await fetch(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      setTemplates((prev) =>
        prev
          .map((t) => (t.id === id ? { ...t, isFavorite: data.template.isFavorite } : t))
          .sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
          })
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" />
        }
      >
        <Bookmark className="h-4 w-4 mr-1" />
        Templates
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meal Templates</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No templates yet. Save a meal as a template from the meal detail view.
            </div>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {t.isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                    <div className="font-medium text-sm truncate">{t.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.calories} kcal · P:{t.protein}g C:{t.carbs}g F:{t.fat}g
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleToggleFavorite(t.id)}
                    title={t.isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star className={`h-3.5 w-3.5 ${t.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onSelect(t);
                      setOpen(false);
                    }}
                  >
                    Use
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
