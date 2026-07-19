"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { MealBubble } from "./MealBubble";
import type { MealData } from "@/types";

interface SortableMealBubbleProps {
  meal: MealData;
  onClick: () => void;
}

export function SortableMealBubble({ meal, onClick }: SortableMealBubbleProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: meal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <MealBubble meal={meal} onClick={onClick} />
      </div>
    </div>
  );
}
