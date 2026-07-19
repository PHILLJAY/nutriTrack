"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle, LinkIcon, Globe, Scale, Download } from "lucide-react";
import type { UserProfile } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState("");
  const [timezone, setTimezone] = useState("");
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => {
        if (r.status === 401) {
          router.push("/onboarding");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setDiscordId(data.user.discordId || "");
          setTimezone(data.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
          setProteinPct(data.user.targetProteinPct ?? 30);
          setCarbsPct(data.user.targetCarbsPct ?? 40);
          setFatPct(data.user.targetFatPct ?? 30);
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLinkDiscord = async () => {
    if (!discordId.trim()) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId: discordId.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        const data = await res.json();
        setUser(data.user);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to link Discord account");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="wordmark text-lg font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <SectionLabel index={1} label="Account & Preferences" />
        {/* Discord Linking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Discord Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link your Discord account to log meals by sending photos to the NutriTrack bot.
            </p>

            <div className="space-y-2">
              <Label htmlFor="discord-id">Discord User ID</Label>
              <div className="flex gap-2">
                <Input
                  id="discord-id"
                  placeholder="e.g. 123456789012345678"
                  value={discordId}
                  onChange={(e) => {
                    setDiscordId(e.target.value);
                    setSaved(false);
                  }}
                />
                <Button
                  onClick={handleLinkDiscord}
                  disabled={saving || !discordId.trim()}
                >
                  {saving ? "Saving..." : saved ? "Saved!" : "Link"}
                </Button>
              </div>
              {saved && (
                <p className="text-sm text-lime flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Discord account linked!
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">How to find your Discord ID:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open Discord → go to User Settings (gear icon)</li>
                <li>Scroll down to <strong>Advanced</strong> → turn on <strong>Developer Mode</strong></li>
                <li>Right-click your username → <strong>Copy User ID</strong></li>
              </ol>
              <p className="text-sm text-muted-foreground mt-2">
                Or just DM the bot <code className="bg-muted px-1 rounded">!link</code> and it will tell you your ID.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-full bg-lime px-3 py-2 text-center text-lime-foreground">
                <div className="text-lg font-bold leading-tight">{user.targetCalories}</div>
                <div className="eyebrow !text-lime-foreground/70">Cal/day</div>
              </div>
              <div className="rounded-full bg-lavender px-3 py-2 text-center text-lavender-foreground">
                <div className="text-lg font-bold leading-tight">{user.targetProtein}g</div>
                <div className="eyebrow !text-lavender-foreground/70">Protein</div>
              </div>
              <div className="rounded-full bg-paper px-3 py-2 text-center text-paper-foreground">
                <div className="text-lg font-bold leading-tight">{user.targetCarbs}g</div>
                <div className="eyebrow !text-paper-foreground/70">Carbs</div>
              </div>
              <div className="rounded-full bg-ink px-3 py-2 text-center text-ink-foreground border border-white/10">
                <div className="text-lg font-bold leading-tight">{user.targetFat}g</div>
                <div className="eyebrow !text-ink-foreground/60">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={timezone} onValueChange={(v) => setTimezone(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "America/New_York", "America/Chicago", "America/Denver",
                    "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu",
                    "America/Toronto", "America/Vancouver",
                    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
                    "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul",
                    "Australia/Sydney", "Australia/Perth", "Pacific/Auckland",
                  ].map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={async () => {
                  await fetch("/api/user", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ timezone }),
                  });
                }}
              >
                Save Timezone
              </Button>
              <p className="text-xs text-muted-foreground">
                Times in meal logs, calendar, and Discord bot will use this timezone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Macro Ratios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Macro Ratios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Customize how your daily calories are split between protein, carbs, and fat. Must add up to 100%.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protein-pct">Protein %</Label>
                  <Input
                    id="protein-pct"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={proteinPct}
                    onChange={(e) => setProteinPct(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(((user?.targetCalories || 2000) * proteinPct / 100) / 4)}g/day
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs-pct">Carbs %</Label>
                  <Input
                    id="carbs-pct"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={carbsPct}
                    onChange={(e) => setCarbsPct(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(((user?.targetCalories || 2000) * carbsPct / 100) / 4)}g/day
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat-pct">Fat %</Label>
                  <Input
                    id="fat-pct"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={fatPct}
                    onChange={(e) => setFatPct(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(((user?.targetCalories || 2000) * fatPct / 100) / 9)}g/day
                  </div>
                </div>
              </div>

              {proteinPct + carbsPct + fatPct !== 100 && (
                <p className="text-sm text-destructive">
                  Ratios must add up to 100% (currently {proteinPct + carbsPct + fatPct}%)
                </p>
              )}

              <Button
                size="sm"
                disabled={proteinPct + carbsPct + fatPct !== 100}
                onClick={async () => {
                  const res = await fetch("/api/user", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      targetProteinPct: proteinPct,
                      targetCarbsPct: carbsPct,
                      targetFatPct: fatPct,
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                  }
                }}
              >
                Save Macro Ratios
              </Button>

              {/* Presets */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => { setProteinPct(30); setCarbsPct(40); setFatPct(30); }}>
                  Balanced
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setProteinPct(40); setCarbsPct(30); setFatPct(30); }}>
                  High Protein
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setProteinPct(25); setCarbsPct(5); setFatPct(70); }}>
                  Keto
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setProteinPct(30); setCarbsPct(50); setFatPct(20); }}>
                  Low Fat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download your meal history and nutrition data.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open("/api/export?format=csv", "_blank")}
              >
                Download CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/api/export?format=json", "_blank")}
              >
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
