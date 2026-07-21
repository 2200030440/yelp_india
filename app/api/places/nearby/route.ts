// app/api/places/nearby/route.ts
// GET /api/places/nearby?lat=xx&lng=xx&radius=5000&type=restaurant
// Calls Google Places Nearby Search v1 API and returns live restaurant data.
// Also auto-syncs each result into Supabase so detail pages work.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  opening_hours?: { open_now?: boolean };
  photos?: Array<{ photo_reference: string }>;
  plus_code?: { compound_code?: string };
}

function getPhotoUrl(ref: string, maxWidth = 600) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${ref}&key=${GOOGLE_API_KEY}`;
}

function slugify(text: string, placeId: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}-${placeId.slice(-6)}`;
}

function inferCategory(types: string[]) {
  if (types.includes("bakery")) return "bakery";
  if (types.includes("cafe")) return "cafe";
  if (types.includes("bar")) return "bar";
  if (types.includes("meal_delivery") || types.includes("meal_takeaway")) return "street-food";
  return "north-indian";
}

function extractCity(vicinity: string): string {
  const parts = vicinity.split(",");
  return parts[parts.length - 1]?.trim() || "India";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") ?? "5000";
    const keyword = searchParams.get("keyword") ?? "restaurant";

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
    }

    // ── Call Google Places Nearby Search ─────────────────────────────────
    const googleUrl =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=${radius}` +
      `&type=restaurant` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&key=${GOOGLE_API_KEY}`;

    const googleRes = await fetch(googleUrl, { next: { revalidate: 300 } });

    if (!googleRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from Google Places" }, { status: 502 });
    }

    const googleData = await googleRes.json();

    if (googleData.status !== "OK" && googleData.status !== "ZERO_RESULTS") {
      console.error("[nearby] Google API status:", googleData.status, googleData.error_message);
      return NextResponse.json(
        { error: `Google API error: ${googleData.status}`, places: [] },
        { status: 200 },
      );
    }

    const results: GooglePlace[] = googleData.results ?? [];

    // ── Ensure default category slugs exist ──────────────────────────────
    const categoryDefaults = [
      { slug: "north-indian",  name: "North Indian",  icon: "🍛", color: "#ef4444" },
      { slug: "cafe",          name: "Café",           icon: "☕", color: "#8b5cf6" },
      { slug: "bakery",        name: "Bakery",         icon: "🧁", color: "#f59e0b" },
      { slug: "bar",           name: "Bar & Grill",    icon: "🍺", color: "#3b82f6" },
      { slug: "street-food",   name: "Street Food",    icon: "🌮", color: "#10b981" },
    ];
    for (const cat of categoryDefaults) {
      try {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        });
      } catch { /* ignore */ }
    }

    // ── Upsert each place into Supabase ──────────────────────────────────
    const places = await Promise.all(
      results.slice(0, 20).map(async (p) => {
        const slug = slugify(p.name, p.place_id);
        const city = extractCity(p.vicinity);
        const catSlug = inferCategory(p.types ?? []);
        const photoUrl = p.photos?.[0]
          ? getPhotoUrl(p.photos[0].photo_reference)
          : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

        try {
          const existing = await prisma.place.findFirst({
            where: { googlePlaceId: p.place_id },
            include: { photos: { take: 1 }, category: true },
          });

          if (existing) {
            return {
              id: existing.id,
              name: existing.name,
              slug: existing.slug,
              city: existing.city,
              state: existing.state,
              address: existing.address,
              latitude: existing.latitude,
              longitude: existing.longitude,
              averageRating: existing.averageRating,
              reviewCount: existing.reviewCount,
              priceLevel: existing.priceLevel,
              isOpen: p.opening_hours?.open_now ?? true,
              category: existing.category?.name ?? "Restaurant",
              primaryPhotoUrl: existing.photos[0]?.url ?? photoUrl,
              googlePlaceId: p.place_id,
            };
          }

          // Create new place record
          const created = await prisma.place.create({
            data: {
              name: p.name,
              slug,
              address: p.vicinity,
              city,
              state: city,
              latitude: p.geometry.location.lat,
              longitude: p.geometry.location.lng,
              averageRating: p.rating ?? 4.0,
              reviewCount: p.user_ratings_total ?? 0,
              priceLevel: p.price_level ?? 2,
              googlePlaceId: p.place_id,
              isVerified: false,
              isFeatured: false,
              isVegOnly: false,
              category: { connect: { slug: catSlug } },
              photos: {
                create: [{ url: photoUrl, isPrimary: true, userId: "system" }],
              },
            },
            include: { photos: { take: 1 }, category: { select: { name: true } } },
          });

          return {
            id: created.id,
            name: created.name,
            slug: created.slug,
            city: created.city,
            state: created.state,
            address: created.address,
            latitude: created.latitude,
            longitude: created.longitude,
            averageRating: created.averageRating,
            reviewCount: created.reviewCount,
            priceLevel: created.priceLevel,
            isOpen: p.opening_hours?.open_now ?? true,
            category: created.category?.name ?? "Restaurant",
            primaryPhotoUrl: created.photos[0]?.url ?? photoUrl,
            googlePlaceId: p.place_id,
          };
        } catch (err) {
          console.warn(`[nearby] upsert failed for ${p.name}:`, err);
          // Return data from Google even if DB upsert fails
          return {
            id: p.place_id,
            name: p.name,
            slug,
            city,
            state: city,
            address: p.vicinity,
            latitude: p.geometry.location.lat,
            longitude: p.geometry.location.lng,
            averageRating: p.rating ?? 4.0,
            reviewCount: p.user_ratings_total ?? 0,
            priceLevel: p.price_level ?? 2,
            isOpen: p.opening_hours?.open_now ?? true,
            category: "Restaurant",
            primaryPhotoUrl: photoUrl,
            googlePlaceId: p.place_id,
          };
        }
      }),
    );

    return NextResponse.json({
      places,
      total: places.length,
      nextPageToken: googleData.next_page_token ?? null,
    });
  } catch (error) {
    console.error("[places/nearby] error:", error);
    return NextResponse.json({ error: "Failed to fetch nearby places", places: [] }, { status: 500 });
  }
}
