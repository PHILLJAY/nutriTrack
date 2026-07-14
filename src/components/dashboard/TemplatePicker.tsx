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
import { Bookmark, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
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
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.calories} kcal · P:{t.protein}g C:{t.carbs}g F:{t.fat}g
                  </div>
                </div>
                <div className="flex gap-1">
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
