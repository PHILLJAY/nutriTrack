"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

interface Suggestion {
  name: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  why: string;
}

export function MealSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/meals/suggest");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setMessage(data.message || "");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Meal Suggestions
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !message && !loading && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Click refresh to get meal ideas based on your remaining macros.
          </p>
        )}

        {message && (
          <p className="text-sm text-muted-foreground text-center py-2">{message}</p>
        )}

        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="font-medium text-sm">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span>{s.estimatedCalories} kcal</span>
                <span>P:{s.estimatedProtein}g</span>
                <span>C:{s.estimatedCarbs}g</span>
                <span>F:{s.estimatedFat}g</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 italic">{s.why}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
