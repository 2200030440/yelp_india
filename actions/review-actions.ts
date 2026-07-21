"use server";

// actions/review-actions.ts
// Server Actions for Creating, Moderating & Liking Diner Reviews

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createReviewSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
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
 * Server Action: Submit a diner review for a restaurant.
 */
export async function createReviewAction(
  formData: unknown,
): Promise<ReviewActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be signed in to submit a review.",
      };
    }

    const parsed = createReviewSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid review data",
      };
    }

    const { placeId, rating, content } = parsed.data;

    // Create review in Prisma
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        placeId,
        rating,
        content,
        isApproved: true,
      },
    });

    // Recalculate average rating & review count for the place
    const reviews = await prisma.review.findMany({
      where: { placeId, deletedAt: null, isApproved: true },
      select: { rating: true },
    });

    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : rating;

    await prisma.place.update({
      where: { id: placeId },
      data: {
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: count,
      },
    });

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
 * Server Action: Like / Helpful vote for a review.
 */
export async function likeReviewAction(
  reviewId: string,
): Promise<ReviewActionResult> {
  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        likeCount: { increment: 1 },
      },
    });

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error("Like review error:", error);
    return {
      success: false,
      error: "Failed to process like action.",
    };
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
      return {
        success: false,
        error: "Unauthorized action.",
      };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Review deleted.",
    };
  } catch (error) {
    console.error("Delete review error:", error);
    return {
      success: false,
      error: "Failed to delete review.",
    };
  }
}
