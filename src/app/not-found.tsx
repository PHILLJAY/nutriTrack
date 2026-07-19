import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4">
        <h1 className="text-4xl font-bold text-lime">404</h1>
        <p className="text-sm text-muted-foreground">
          This page doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
