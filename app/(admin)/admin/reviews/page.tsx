"use client";

import { useState } from "react";
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
} from "lucide-react";

const INITIAL_REVIEWS = [
  {
    id: "r1",
    user: "Vikram Malhotra",
    restaurant: "Trishna Coastal Dining",
    rating: 5,
    comment:
      "The Garlic Butter Crab is absolute perfection! Served piping hot with fresh appams. Outstanding dining experience in Mumbai.",
    date: "10 minutes ago",
    status: "Approved",
  },
  {
    id: "r2",
    user: "Ananya Sharma",
    restaurant: "Paradise Biryani House",
    rating: 4,
    comment:
      "Great authentic Hyderabadi flavor, but the restaurant was super crowded during Sunday evening peak hours.",
    date: "25 minutes ago",
    status: "Approved",
  },
  {
    id: "r3",
    user: "Dev Kumar",
    restaurant: "Indian Accent",
    rating: 1,
    comment: "Spam text promo link example...",
    date: "1 hour ago",
    status: "Pending",
  },
  {
    id: "r4",
    user: "Sneha Patel",
    restaurant: "Bukhara - ITC Maurya",
    rating: 5,
    comment:
      "Dal Bukhara cooked overnight for 18 hours is worth every rupee. Outstanding hospitality!",
    date: "3 hours ago",
    status: "Approved",
  },
];

export default function ReviewModerationPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  const handleApprove = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)),
    );
  };

  const handleReject = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)),
    );
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
          <MessageSquare className="h-7 w-7 text-red-600" /> Diner Review Moderation
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Moderate, approve, or reject user-submitted restaurant reviews & ratings.
        </p>
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-center"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-900">{rev.user}</span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {rev.date}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    rev.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : rev.status === "Rejected"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              <div className="text-xs font-semibold text-zinc-500">
                Restaurant: <span className="text-zinc-800">{rev.restaurant}</span>
              </div>

              <div className="flex items-center gap-0.5 my-1">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
              {rev.status !== "Approved" && (
                <button
                  onClick={() => handleApprove(rev.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
              )}
              {rev.status !== "Rejected" && (
                <button
                  onClick={() => handleReject(rev.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-500" /> Reject
                </button>
              )}
              <button
                onClick={() => handleDelete(rev.id)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
