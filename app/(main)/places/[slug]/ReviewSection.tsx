"use client";
// app/(main)/places/[slug]/ReviewSection.tsx
// Interactive review section: list + submit new review

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Send, Star, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { type Review, reviewsApi } from "@/lib/api";

interface Props {
  placeId:        string;
  placeName:      string;
  initialReviews: Review[];
  reviewCount:    number;
}

export default function ReviewSection({ placeId, placeName, initialReviews, reviewCount }: Props) {
  const { data: session } = useSession();
  const { toast }         = useToast();

  const [reviews,         setReviews]         = useState<Review[]>(initialReviews);
  const [showForm,        setShowForm]        = useState(false);
  const [rating,          setRating]          = useState(5);
  const [content,         setContent]         = useState("");
  const [hoverRating,     setHoverRating]     = useState(0);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast("Please log in to write a review", "error");
      return;
    }
    if (content.trim().length < 10) {
      toast("Review must be at least 10 characters", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const { review } = await reviewsApi.create({ placeId, rating, content: content.trim() });
      setReviews([review, ...reviews]);
      setContent("");
      setRating(5);
      setShowForm(false);
      toast("✓ Your review has been published!", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-600" />
          Diner Reviews ({reviewCount.toLocaleString("en-IN")})
        </h2>
        {session?.user ? (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
          >
            {showForm ? "Cancel" : "Write Review"}
          </Button>
        ) : (
          <Link
            href="/login"
            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Log in to review
          </Link>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-zinc-900 text-sm">
            Write Your Review for {placeName}
          </h3>

          {/* Star Rating Picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
              Your Rating
            </label>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-zinc-700 self-center">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
              Your Experience
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share details about the food quality, service, ambiance..."
              className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white resize-none"
            />
            <p className={cn("text-xs mt-1", content.length < 10 ? "text-zinc-400" : "text-emerald-600")}>
              {content.length}/10 minimum characters
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || content.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="h-4 w-4" /> Submit Review</>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="flex flex-col divide-y divide-zinc-100">
        {reviews.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-zinc-400">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">No reviews yet. Be the first to review!</p>
          </div>
        )}
        {reviews.map((rev) => (
          <div key={rev.id} className="py-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {rev.user.image ? (
                  <Image
                    src={rev.user.image}
                    alt={rev.user.name ?? "User"}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white text-sm">
                    {rev.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{rev.user.name ?? "Anonymous"}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200",
                    )}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-zinc-700">&ldquo;{rev.content}&rdquo;</p>

            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({rev._count?.likes ?? rev.likeCount ?? 0})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
