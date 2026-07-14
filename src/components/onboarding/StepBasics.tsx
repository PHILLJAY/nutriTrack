"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepBasicsProps {
  data: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    timezone: string;
  };
  onChange: (data: Partial<StepBasicsProps["data"]>) => void;
}

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Perth",
  "Pacific/Auckland",
];

export function StepBasics({ data, onChange }: StepBasicsProps) {
  const detectedTz = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">About You</h2>
        <p className="text-muted-foreground">
          Let&apos;s start with your basic info to calculate your nutrition targets.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              placeholder="25"
              value={data.age}
              onChange={(e) => onChange({ age: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={data.gender}
              onValueChange={(v) => onChange({ gender: v as string })}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              inputMode="decimal"
              placeholder="175"
              value={data.height}
              onChange={(e) => onChange({ height: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              placeholder="70"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={detectedTz}
            onValueChange={(v) => onChange({ timezone: v as string })}
          >
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
              {!COMMON_TIMEZONES.includes(detectedTz) && (
                <SelectItem value={detectedTz}>{detectedTz.replace(/_/g, " ")}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
