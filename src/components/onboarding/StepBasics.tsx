"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepBasicsProps {
  data: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
  };
  onChange: (data: Partial<StepBasicsProps["data"]>) => void;
}

export function StepBasics({ data, onChange }: StepBasicsProps) {
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
              placeholder="25"
              value={data.age}
              onChange={(e) => onChange({ age: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={data.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
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
              placeholder="70"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
