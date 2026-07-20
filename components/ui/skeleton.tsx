import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-zinc-200/80", className)}
      {...props}
    />
  );
}

/**
 * Pre-built Skeleton Loader Card for Restaurant Listings
 */
function RestaurantSkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-2/5" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, RestaurantSkeletonCard };
