"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, LinkIcon, Globe } from "lucide-react";
import type { UserProfile } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [discordId, setDiscordId] = useState("");
  const [timezone, setTimezone] = useState("");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                <p className="text-sm text-green-600 flex items-center gap-1">
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
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {user.targetCalories}
                </div>
                <div className="text-xs text-muted-foreground">Cal/day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {user.targetProtein}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {user.targetCarbs}g
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {user.targetFat}g
                </div>
                <div className="text-xs text-muted-foreground">Fat</div>
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
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {[
                  "America/New_York", "America/Chicago", "America/Denver",
                  "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu",
                  "America/Toronto", "America/Vancouver",
                  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
                  "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul",
                  "Australia/Sydney", "Australia/Perth", "Pacific/Auckland",
                ].map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </select>
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
      </main>
    </div>
  );
}
