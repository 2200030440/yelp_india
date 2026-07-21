// app/(main)/places/[slug]/loading.tsx
// Skeleton shown while server-side data loads

export default function PlaceDetailLoading() {
  return (
    <div className="bg-zinc-50 min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-zinc-900 pt-8 pb-12">
        <div className="container">
          <div className="h-4 w-40 bg-zinc-700 rounded mb-4" />
          <div className="h-10 w-96 bg-zinc-700 rounded mb-3" />
          <div className="h-5 w-64 bg-zinc-700 rounded mb-4" />
          <div className="h-5 w-48 bg-zinc-700 rounded mb-8" />
          {/* Gallery skeleton */}
          <div className="h-72 bg-zinc-800 rounded-2xl" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="h-6 w-40 bg-zinc-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-zinc-100 rounded" />
                <div className="h-4 bg-zinc-100 rounded" />
                <div className="h-4 w-2/3 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm h-64" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm h-48" />
            <div className="rounded-2xl bg-zinc-200 h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
