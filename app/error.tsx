"use client";

// app/error.tsx
// Global error boundary — catches unhandled errors in the app.
// Must be a Client Component.

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service (e.g., Sentry) in Phase 16
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">500</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500">
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-red-500 px-6 py-3 text-white transition hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}
