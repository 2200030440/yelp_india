// app/not-found.tsx
// 404 page — rendered when no route matches.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page not found
      </h2>
      <p className="mt-2 max-w-md text-gray-500">
        Sorry, we couldn&apos;t find the page you were looking for. It may have
        been moved or deleted.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-red-500 px-6 py-3 text-white transition hover:bg-red-600"
        >
          Go home
        </Link>
        <Link
          href="/places"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-50"
        >
          Browse places
        </Link>
      </div>
    </div>
  );
}
