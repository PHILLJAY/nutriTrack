"use client";

import { cn } from "@/lib/utils";

interface HealthBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export function HealthBadge({ rating, size = "md" }: HealthBadgeProps) {
  const color =
    rating >= 80
      ? "bg-green-500"
      : rating >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white",
        color,
        sizeClasses[size]
      )}
    >
      {rating}
    </div>
  );
}
