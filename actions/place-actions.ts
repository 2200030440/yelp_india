"use server";

// actions/place-actions.ts
// Server Actions for Restaurant Queries, Search & Filtering

import { prisma } from "@/lib/prisma";
import type { PlaceFilters } from "@/types";

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface PlaceActionResult {
  success: boolean;
  data?: unknown[];
  total?: number;
  error?: string;
}

/**
 * Server Action: Search and filter restaurants in database.
 */
export async function getPlacesAction(
  filters: PlaceFilters,
): Promise<PlaceActionResult> {
  try {
    const {
      categorySlug,
      city,
      minRating,
      priceLevel,
      search,
      sortBy = "rating",
      page = 1,
      pageSize = 12,
    } = filters;

    // Build Prisma dynamic where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      deletedAt: null,
    };

    if (categorySlug && categorySlug !== "all") {
      whereClause.category = { slug: categorySlug };
    }

    if (city && city !== "all") {
      whereClause.city = { equals: city, mode: "insensitive" };
    }

    if (minRating) {
      whereClause.averageRating = { gte: minRating };
    }

    if (priceLevel && priceLevel.length > 0) {
      whereClause.priceLevel = { in: priceLevel };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    // Order By logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { averageRating: "desc" };
    if (sortBy === "reviewCount") {
      orderBy = { reviewCount: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          photos: {
            where: { isPrimary: true },
            select: { id: true, url: true, caption: true, isPrimary: true },
            take: 1,
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.place.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: places,
      total,
    };
  } catch (error) {
    console.error("Get places error:", error);
    return {
      success: false,
      error: "Failed to fetch restaurants.",
    };
  }
}
