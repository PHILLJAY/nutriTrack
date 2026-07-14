"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

export function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    const res = await fetch("/api/weight?limit=30");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleLog = async () => {
    if (!weight) return;
    setLoading(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });
      if (res.ok) {
        setWeight("");
        fetchEntries();
      }
    } finally {
      setLoading(false);
    }
  };

  const latest = entries[entries.length - 1];
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const diff = latest && previous ? latest.weight - previous.weight : 0;

  const chartData = entries.map((e) => ({
    date: format(new Date(e.date), "MMM d"),
    weight: e.weight,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="h-4 w-4 text-purple-500" />
          Weight Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current weight */}
        {latest && (
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">{latest.weight} kg</div>
            {diff !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${diff < 0 ? "text-green-500" : "text-red-500"}`}>
                {diff < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                {Math.abs(diff).toFixed(1)} kg
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {entries.length > 1 && (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Log weight */}
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Weight in kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
          />
          <Button onClick={handleLog} disabled={loading || !weight}>
            {loading ? "..." : "Log"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
