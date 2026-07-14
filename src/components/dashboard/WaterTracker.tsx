"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

const DAILY_GOAL = 8;

export function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(false);
  const date = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetch(`/api/water?date=${date}`)
      .then((r) => r.json())
      .then((data) => setGlasses(data.glasses || 0))
      .catch(() => {});
  }, [date]);

  const updateGlasses = async (newCount: number) => {
    if (newCount < 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glasses: newCount, date }),
      });
      if (res.ok) {
        setGlasses(newCount);
      }
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min(100, (glasses / DAILY_GOAL) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => updateGlasses(glasses - 1)}
            disabled={loading || glasses <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{glasses} / {DAILY_GOAL} glasses</span>
              <span className="text-muted-foreground">{Math.round(pct)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => updateGlasses(glasses + 1)}
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
