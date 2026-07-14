"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";

interface NLPEditInputProps {
  mealId: string;
  onUpdate: () => void;
}

export function NLPEditInput({ mealId, onUpdate }: NLPEditInputProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!instruction.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meals/nlp-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId, instruction }),
      });

      if (res.ok) {
        setInstruction("");
        onUpdate();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="e.g. 'the protein should be 35g' or 'I only ate half'"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading || !instruction.trim()}
          className="h-10 px-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Update"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
