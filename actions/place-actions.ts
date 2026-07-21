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

    if (filters.isVegOnly) {
      whereClause.isVegOnly = true;
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

export interface SyncPlaceInput {
  name: string;
  slug?: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  priceLevel?: number;
  phone?: string;
  website?: string;
  photoUrl?: string;
  categorySlug?: string;
  googlePlaceId?: string;
}

/**
 * Server Action: Sync / Upsert a live Google or nearby place into Supabase DB.
 * Ensures that whenever a user views or reviews a restaurant found on Google Maps / GPS,
 * it is registered in Supabase so reviews are permanently saved and shown to everyone.
 */
export async function syncPlaceAction(input: SyncPlaceInput) {
  try {
    const rawSlug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${rawSlug}-${Math.abs(Math.round(input.latitude * 100))}`;

    // Check if place already exists
    const existing = await prisma.place.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: slug },
          { name: { equals: input.name, mode: "insensitive" }, city: { equals: input.city, mode: "insensitive" } },
        ],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (existing) {
      return { success: true, place: existing };
    }

    // Find or fallback Category
    let category = await prisma.category.findFirst({
      where: { slug: input.categorySlug || "north-indian" },
    });

    if (!category) {
      category = await prisma.category.findFirst();
    }

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Restaurants",
          slug: "restaurants",
          description: "Dining & Food",
        },
      });
    }

    // Create new Place record in Supabase
    const created = await prisma.place.create({
      data: {
        name: input.name,
        slug: slug,
        description: input.description || `Authentic dining experience in ${input.city}.`,
        address: input.address,
        city: input.city,
        state: input.state || "India",
        country: "India",
        latitude: input.latitude,
        longitude: input.longitude,
        priceLevel: input.priceLevel || 2,
        phone: input.phone || null,
        website: input.website || null,
        isVerified: true,
        isFeatured: false,
        averageRating: 0.0,
        reviewCount: 0,
        categoryId: category.id,
      },
    });

    // Add Primary Photo if provided
    if (input.photoUrl) {
      const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (adminUser) {
        await prisma.photo.create({
          data: {
            url: input.photoUrl,
            isPrimary: true,
            placeId: created.id,
            userId: adminUser.id,
          },
        });
      }
    }

    return { success: true, place: created };
  } catch (error) {
    console.error("Sync place error:", error);
    return { success: false, error: "Failed to sync restaurant into database." };
  }
}
