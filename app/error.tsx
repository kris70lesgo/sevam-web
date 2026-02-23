"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div>
        <p className="text-5xl mb-2">⚠️</p>
        <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-muted text-sm">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted font-mono">ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </main>
  );
}
