"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 1 to 5
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(currentDisplayRating);

        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={cn(
              "transition-transform",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
            )}
            aria-label={`${starValue} Star Rating`}
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 text-zinc-200",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
