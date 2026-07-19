"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4">
        <h1 className="text-4xl font-bold text-lime">404</h1>
        <p className="text-sm text-muted-foreground">
          This page doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
