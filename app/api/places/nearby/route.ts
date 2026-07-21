// app/api/places/nearby/route.ts
// GET /api/places/nearby?lat=xx&lng=xx&radius=5000
// Uses Google Places API (New) v1 — Nearby Search endpoint.
// Auto-syncs each result into Supabase so detail & review pages work immediately.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

interface NewPlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: Array<{ name: string }>;
  types?: string[];
  currentOpeningHours?: { openNow?: boolean };
  regularOpeningHours?: { openNow?: boolean };
}

function slugify(text: string, placeId: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${base}-${placeId.slice(-6)}`;
}

function parsePriceLevel(level?: string): number {
  switch (level) {
    case "PRICE_LEVEL_FREE":           return 1;
    case "PRICE_LEVEL_INEXPENSIVE":    return 1;
    case "PRICE_LEVEL_MODERATE":       return 2;
    case "PRICE_LEVEL_EXPENSIVE":      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE": return 4;
    default: return 2;
  }
}

function getPhotoUrl(photoName: string): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&key=${GOOGLE_API_KEY}`;
}

function extractCity(address: string, fallback: string): string {
  const parts = address.split(",");
  if (parts.length >= 3) return parts[parts.length - 3].trim();
  return fallback;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = Number(searchParams.get("radius") ?? "5000");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
    }

    // ── Call Google Places API (New) — Nearby Search ──────────────────────
    const googleRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location," +
          "places.rating,places.userRatingCount,places.priceLevel,places.photos," +
          "places.types,places.currentOpeningHours,places.regularOpeningHours",
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude: Number(lat), longitude: Number(lng) },
            radius,
          },
        },
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        languageCode: "en",
      }),
    });

    const googleData = await googleRes.json();

    if (googleData.error) {
      console.error("[nearby] Google API error:", googleData.error);
      return NextResponse.json(
        { error: `Google API: ${googleData.error.status}`, places: [] },
        { status: 200 },
      );
    }

    const results: NewPlaceResult[] = googleData.places ?? [];

    // ── Ensure default categories exist ──────────────────────────────────
    const catDefaults = [
      { slug: "north-indian", name: "North Indian", icon: "🍛" },
      { slug: "cafe",         name: "Café",          icon: "☕" },
      { slug: "bakery",       name: "Bakery",        icon: "🧁" },
      { slug: "bar",          name: "Bar & Grill",   icon: "🍺" },
      { slug: "street-food",  name: "Street Food",   icon: "🌮" },
    ];
    for (const cat of catDefaults) {
      try {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        });
      } catch { /* ignore */ }
    }

    // ── Ensure admin user exists for valid Photo relations ───────────────
    let admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          name: "Yelp Admin",
          email: "admin@yelpindia.com",
          role: "ADMIN",
          city: "Mumbai",
        },
      });
    }
    const adminId = admin.id;

    // ── Upsert each place into Supabase ──────────────────────────────────
    const places = await Promise.all(
      results.map(async (p) => {
        const name = p.displayName?.text;
        if (!name) return null;

        const slug = slugify(name, p.id);
        const address = p.formattedAddress ?? "India";
        const city = extractCity(address, "India");
        const photoUrl = p.photos?.[0]
          ? getPhotoUrl(p.photos[0].name)
          : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

        const isOpen =
          p.currentOpeningHours?.openNow ??
          p.regularOpeningHours?.openNow ??
          true;

        let catSlug = "north-indian";
        const types = p.types ?? [];
        if (types.includes("bakery")) catSlug = "bakery";
        else if (types.includes("cafe")) catSlug = "cafe";
        else if (types.includes("bar")) catSlug = "bar";

        try {
          const existing = await prisma.place.findFirst({
            where: { googlePlaceId: p.id },
            include: { photos: { take: 1 }, category: { select: { name: true } } },
          });

          if (existing) {
            return {
              id: existing.id,
              name: existing.name,
              slug: existing.slug,
              city: existing.city,
              address: existing.address,
              latitude: existing.latitude,
              longitude: existing.longitude,
              averageRating: existing.averageRating,
              reviewCount: existing.reviewCount,
              priceLevel: existing.priceLevel,
              isOpen,
              category: existing.category?.name ?? "Restaurant",
              primaryPhotoUrl: existing.photos[0]?.url ?? photoUrl,
              googlePlaceId: p.id,
            };
          }

          const created = await prisma.place.create({
            data: {
              name,
              slug,
              address,
              city,
              state: city,
              latitude: p.location?.latitude,
              longitude: p.location?.longitude,
              averageRating: p.rating ?? 4.0,
              reviewCount: p.userRatingCount ?? 0,
              priceLevel: parsePriceLevel(p.priceLevel),
              googlePlaceId: p.id,
              isVerified: false,
              isFeatured: false,
              isVegOnly: false,
              category: { connect: { slug: catSlug } },
              photos: {
                create: [{ url: photoUrl, isPrimary: true, userId: adminId }],
              },
            },
            include: { photos: { take: 1 }, category: { select: { name: true } } },
          });

          return {
            id: created.id,
            name: created.name,
            slug: created.slug,
            city: created.city,
            address: created.address,
            latitude: created.latitude,
            longitude: created.longitude,
            averageRating: created.averageRating,
            reviewCount: created.reviewCount,
            priceLevel: created.priceLevel,
            isOpen,
            category: created.category?.name ?? "Restaurant",
            primaryPhotoUrl: created.photos[0]?.url ?? photoUrl,
            googlePlaceId: p.id,
          };
        } catch (err) {
          console.warn(`[nearby] upsert failed for ${name}:`, (err as Error).message?.slice(0, 60));
          // Return Google data directly even if DB save fails
          return {
            id: p.id,
            name,
            slug,
            city,
            address,
            latitude: p.location?.latitude,
            longitude: p.location?.longitude,
            averageRating: p.rating ?? 4.0,
            reviewCount: p.userRatingCount ?? 0,
            priceLevel: parsePriceLevel(p.priceLevel),
            isOpen,
            category: "Restaurant",
            primaryPhotoUrl: photoUrl,
            googlePlaceId: p.id,
          };
        }
      }),
    );

    const validPlaces = places.filter(Boolean);

    return NextResponse.json({
      places: validPlaces,
      total: validPlaces.length,
    });
  } catch (error) {
    console.error("[places/nearby] error:", error);
    return NextResponse.json({ error: "Failed to fetch nearby places", places: [] }, { status: 500 });
  }
}
