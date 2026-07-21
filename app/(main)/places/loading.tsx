// app/(main)/places/loading.tsx
export default function PlacesLoading() {
  return (
    <div className="bg-zinc-50 min-h-screen animate-pulse">
      <div className="bg-white border-b border-zinc-200 py-10 px-4">
        <div className="container">
          <div className="h-8 w-72 bg-zinc-200 rounded mb-2" />
          <div className="h-4 w-96 bg-zinc-100 rounded" />
          <div className="mt-6 h-12 bg-zinc-100 rounded-xl" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-zinc-100 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white overflow-hidden shadow-sm">
              <div className="h-52 bg-zinc-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-zinc-200 rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 rounded" />
                <div className="h-4 w-1/3 bg-zinc-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
