"use server";

// actions/review-actions.ts
// Server Actions for Creating, Editing, Deleting, Moderating, Reporting & Liking Diner Reviews

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const reviewInputSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters long")
    .max(2000, "Review cannot exceed 2000 characters"),
});

export interface ReviewActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

/**
 * Helper to recalculate place average rating & review count.
 */
async function recalculatePlaceMetrics(placeId: string) {
  const reviews = await prisma.review.findMany({
    where: { placeId, deletedAt: null, isApproved: true },
    select: { rating: true },
  });

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0.0;

  await prisma.place.update({
    where: { id: placeId },
    data: {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: count,
    },
  });
}

/**
 * Server Action: Submit a diner review for a restaurant.
 */
export async function createReviewAction(
  formData: { placeId: string; rating: number; content: string },
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be signed in to submit a review.",
      };
    }

    const parsed = reviewInputSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid review data",
      };
    }

    const { rating, content } = parsed.data;

    // Create review in Prisma
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        placeId: formData.placeId,
        rating,
        content,
        isApproved: true,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    await recalculatePlaceMetrics(formData.placeId);

    return {
      success: true,
      message: "Review submitted successfully!",
      data: review,
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

/**
 * Server Action: Edit an existing diner review.
 */
export async function updateReviewAction(
  reviewId: string,
  formData: { rating: number; content: string },
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "You must be signed in to edit your review." };
    }

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing || existing.deletedAt) {
      return { success: false, error: "Review not found." };
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to edit this review." };
    }

    const parsed = reviewInputSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid content" };
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: parsed.data.rating,
        content: parsed.data.content,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    await recalculatePlaceMetrics(existing.placeId);

    return { success: true, message: "Review updated successfully!", data: updated };
  } catch (error) {
    console.error("Update review error:", error);
    return { success: false, error: "Failed to update review." };
  }
}

/**
 * Server Action: Soft delete a review.
 */
export async function deleteReviewAction(
  reviewId: string,
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized action." };
    }

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing || existing.deletedAt) {
      return { success: false, error: "Review not found." };
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to delete this review." };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { deletedAt: new Date() },
    });

    await recalculatePlaceMetrics(existing.placeId);

    return { success: true, message: "Review deleted successfully." };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, error: "Failed to delete review." };
  }
}

/**
 * Server Action: Like / Helpful vote for a review.
 */
export async function likeReviewAction(
  reviewId: string,
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "You must be signed in to like reviews." };
    }

    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId,
        },
      },
    });

    if (existingLike) {
      await prisma.reviewLike.delete({ where: { id: existingLike.id } });
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: { likeCount: { decrement: 1 } },
      });
      return { success: true, message: "Like removed", data: review };
    }

    await prisma.reviewLike.create({
      data: { userId: session.user.id, reviewId },
    });

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { likeCount: { increment: 1 } },
    });

    return { success: true, message: "Marked as helpful!", data: review };
  } catch (error) {
    console.error("Like review error:", error);
    return { success: false, error: "Failed to process like action." };
  }
}

/**
 * Server Action: Report an inappropriate review.
 */
export async function reportReviewAction(
  reviewId: string,
  reason: string,
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "You must be signed in to report a review." };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Please provide a valid reason (at least 5 characters)." };
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        reviewId,
        reason: reason.trim(),
        status: "PENDING",
      },
    });

    return { success: true, message: "Report submitted to moderators. Thank you!", data: report };
  } catch (error) {
    console.error("Report review error:", error);
    return { success: false, error: "Failed to submit report." };
  }
}
