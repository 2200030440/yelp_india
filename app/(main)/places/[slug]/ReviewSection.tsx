"use client";
// app/(main)/places/[slug]/ReviewSection.tsx
// Interactive review section: list, submit, edit, delete, report, and like reviews

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  Loader2,
  Edit2,
  Trash2,
  Flag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { type Review, reviewsApi } from "@/lib/api";
import {
  updateReviewAction,
  deleteReviewAction,
  likeReviewAction,
  reportReviewAction,
} from "@/actions/review-actions";

interface Props {
  placeId: string;
  placeName: string;
  initialReviews: Review[];
  reviewCount: number;
}

export default function ReviewSection({
  placeId,
  placeName,
  initialReviews,
  reviewCount,
}: Props) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Report State
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

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
      const { review } = await reviewsApi.create({
        placeId,
        rating,
        content: content.trim(),
      });
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

  const handleStartEdit = (rev: Review) => {
    setEditingId(rev.id);
    setEditRating(rev.rating);
    setEditContent(rev.content);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (editContent.trim().length < 10) {
      toast("Review must be at least 10 characters", "error");
      return;
    }
    setIsEditing(true);
    try {
      const res = await updateReviewAction(editingId, {
        rating: editRating,
        content: editContent.trim(),
      });
      if (res.success && res.data) {
        const updatedRev = res.data as Review;
        setReviews((prev) =>
          prev.map((r) => (r.id === editingId ? { ...r, ...updatedRev } : r))
        );
        setEditingId(null);
        toast("✓ Review updated successfully!", "success");
      } else {
        toast(res.error || "Failed to update review", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error updating review", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast("✓ Review deleted", "success");
      } else {
        toast(res.error || "Failed to delete review", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error deleting review", "error");
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!session?.user) {
      toast("Please log in to like reviews", "error");
      return;
    }
    try {
      const res = await likeReviewAction(reviewId);
      if (res.success && res.data) {
        const updated = res.data as { likeCount: number };
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  likeCount: updated.likeCount,
                  _count: { likes: updated.likeCount },
                }
              : r
          )
        );
        toast(res.message || "Updated vote", "success");
      } else {
        toast(res.error || "Failed to vote", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingId || !reportReason.trim()) return;
    setIsReporting(true);
    try {
      const res = await reportReviewAction(reportingId, reportReason.trim());
      if (res.success) {
        setReportingId(null);
        setReportReason("");
        toast("✓ Report submitted to moderators. Thank you!", "success");
      } else {
        toast(res.error || "Failed to submit report", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error submitting report", "error");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-600" />
          Diner Reviews ({(reviews.length || reviewCount).toLocaleString("en-IN")})
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

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-zinc-900 text-sm">
            Write Your Review for {placeName}
          </h3>

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
                        : "fill-zinc-200 text-zinc-200"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-zinc-700 self-center">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                  hoverRating || rating
                ]}
              </span>
            </div>
          </div>

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
            <p
              className={cn(
                "text-xs mt-1",
                content.length < 10 ? "text-zinc-400" : "text-emerald-600"
              )}
            >
              {content.length}/10 minimum characters
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || content.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Report Review Modal */}
      {reportingId && (
        <form
          onSubmit={handleReport}
          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertCircle className="h-4 w-4" /> Report Inappropriate Review
          </div>
          <textarea
            rows={2}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please specify why this review violates community guidelines (e.g. hate speech, spam)..."
            className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportingId(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isReporting || reportReason.trim().length < 5}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
            >
              {isReporting ? "Submitting…" : "Submit Report"}
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

        {reviews.map((rev) => {
          const isAuthor = session?.user?.id === rev.user?.id;
          const isAdmin = session?.user?.role === "ADMIN";

          return (
            <div key={rev.id} className="py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.user?.image ? (
                    <Image
                      src={rev.user.image}
                      alt={rev.user.name ?? "User"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white text-sm">
                      {rev.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {rev.user?.name ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
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
                        i < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-200 text-zinc-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Inline Edit Mode */}
              {editingId === rev.id ? (
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/30 p-3"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditRating(s)}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            s <= editRating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-zinc-200 text-zinc-200"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isEditing}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isEditing ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-700">
                  &ldquo;{rev.content}&rdquo;
                </p>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                <button
                  onClick={() => handleLike(rev.id)}
                  className="flex items-center gap-1.5 font-medium hover:text-red-600 transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful (
                  {rev._count?.likes ?? rev.likeCount ?? 0})
                </button>

                <div className="flex items-center gap-3">
                  {(isAuthor || isAdmin) && (
                    <>
                      <button
                        onClick={() => handleStartEdit(rev)}
                        className="flex items-center gap-1 hover:text-zinc-900 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                  {session?.user && !isAuthor && (
                    <button
                      onClick={() => setReportingId(rev.id)}
                      className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                    >
                      <Flag className="h-3.5 w-3.5" /> Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
