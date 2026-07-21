// app/(main)/places/[slug]/not-found.tsx
import Link from "next/link";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";

export default function PlaceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
        <UtensilsCrossed className="h-10 w-10 text-red-600" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Restaurant Not Found</h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          We couldn&apos;t find this restaurant. It may have been removed or the link may be incorrect.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/places"
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Browse Restaurants
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
