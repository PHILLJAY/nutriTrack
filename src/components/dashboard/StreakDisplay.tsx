"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Calendar } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  todayLogged: boolean;
  heatmap: { date: string; count: number }[];
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  totalDaysLogged,
  todayLogged,
  heatmap,
}: StreakDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className={`h-5 w-5 mx-auto mb-1 ${currentStreak > 0 ? "text-lime" : "text-muted-foreground"}`} />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-[#f2b45c]" />
            <div className="text-2xl font-bold">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-lavender" />
            <div className="text-2xl font-bold">{totalDaysLogged}</div>
            <div className="text-xs text-muted-foreground">Days Logged</div>
          </CardContent>
        </Card>
      </div>

      {/* Today status */}
      <div className={`text-center text-sm py-2 rounded-full ${todayLogged ? "bg-lime/15 text-lime" : "bg-muted text-muted-foreground"}`}>
        {todayLogged ? "You've logged today!" : "Log a meal to keep your streak alive"}
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Last 90 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-[2px]">
            {heatmap.map((day) => (
              <div
                key={day.date}
                className={`w-[10px] h-[10px] rounded-sm ${
                  day.count > 0 ? "bg-lime" : "bg-muted"
                }`}
                title={`${day.date}: ${day.count > 0 ? "Logged" : "No meals"}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
