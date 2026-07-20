"use server";

// features/favorites/actions/favorite-actions.ts
// Server Actions for Managing User Favorite / Bookmarked Restaurants

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface FavoriteActionResult {
  success: boolean;
  isSaved?: boolean;
  message?: string;
  error?: string;
  data?: unknown[];
}

/**
 * Server Action: Toggle restaurant bookmark for logged-in user.
 */
export async function toggleFavoriteAction(
  placeId: string,
): Promise<FavoriteActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be signed in to save restaurants.",
      };
    }

    const userId = session.user.id;

    // Check if favorite exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return {
        success: true,
        isSaved: false,
        message: "Removed from saved places.",
      };
    } else {
      // Add bookmark
      await prisma.favorite.create({
        data: {
          userId,
          placeId,
        },
      });
      return {
        success: true,
        isSaved: true,
        message: "Saved to your favourite places!",
      };
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return {
      success: false,
      error: "Failed to update saved status.",
    };
  }
}

/**
 * Server Action: Fetch user's saved restaurants.
 */
export async function getUserFavoritesAction(): Promise<FavoriteActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        place: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            photos: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: favorites.map((f) => f.place),
    };
  } catch (error) {
    console.error("Get user favorites error:", error);
    return {
      success: false,
      error: "Failed to fetch saved places.",
    };
  }
}
