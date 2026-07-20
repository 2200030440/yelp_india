import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import StarRating from "@/components/common/StarRating";
import { cn, formatRating, formatPriceLevel } from "@/lib/utils";

export interface RestaurantCardProps {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  image: string;
  isOpen?: boolean;
  badge?: string | null;
  isSaved?: boolean;
  onBookmarkToggle?: (id: string) => void;
}

export default function RestaurantCard({
  name,
  slug,
  cuisine,
  city,
  rating,
  reviewCount,
  priceLevel,
  image,
  isOpen = true,
  badge,
  isSaved = false,
  onBookmarkToggle,
}: RestaurantCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image Container */}
      <Link href={`/places/${slug}`} className="relative h-48 overflow-hidden bg-zinc-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge */}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-sm">
            {badge}
          </span>
        )}

        {/* Open / Closed Tag */}
        <span
          className={cn(
            "absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
            isOpen
              ? "bg-emerald-600/90 text-white"
              : "bg-zinc-800/80 text-zinc-300",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isOpen ? "bg-white" : "bg-zinc-400",
            )}
          />
          {isOpen ? "Open now" : "Closed"}
        </span>
      </Link>

      {/* Bookmark Button */}
      {onBookmarkToggle && (
        <button
          onClick={() => onBookmarkToggle(slug)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:text-red-600"
          aria-label="Save Restaurant"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isSaved ? "fill-red-600 text-red-600" : "text-zinc-600",
            )}
          />
        </button>
      )}

      {/* Details Section */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/places/${slug}`}>
            <h3 className="font-semibold text-zinc-900 leading-snug transition-colors group-hover:text-red-600">
              {name}
            </h3>
          </Link>
          <span className="shrink-0 text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
            {formatPriceLevel(priceLevel)}
          </span>
        </div>

        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <span>{cuisine}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3 text-zinc-400" /> {city}
          </span>
        </p>

        {/* Rating */}
        <div className="mt-auto flex items-center gap-2 pt-2 border-t border-zinc-100">
          <StarRating rating={rating} size="sm" />
          <span className="text-xs font-bold text-zinc-800">
            {formatRating(rating)}
          </span>
          <span className="text-xs text-zinc-400">
            ({reviewCount.toLocaleString("en-IN")} reviews)
          </span>
        </div>
      </div>
    </div>
  );
}
