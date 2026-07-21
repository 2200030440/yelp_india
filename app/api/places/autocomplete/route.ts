// app/api/places/autocomplete/route.ts
// Real-time Autocomplete Suggestions for Restaurants & Locations in India.
// Queries Google Places Autocomplete API (restricted to country:in),
// with automatic fallback to local database restaurants & cities.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input")?.trim() || "";

    if (!input || input.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&types=establishment|geocode&key=${apiKey}`;
      const res = await fetch(googleUrl);
      if (res.ok) {
        const data = await res.json();
        const suggestions = (data.predictions || []).map((item: { place_id: string; description: string; structured_formatting?: { main_text?: string; secondary_text?: string } }) => ({
          googlePlaceId: item.place_id,
          text: item.description,
          mainText: item.structured_formatting?.main_text || item.description,
          secondaryText: item.structured_formatting?.secondary_text || "India",
        }));
        if (suggestions.length > 0) {
          return NextResponse.json({ suggestions, source: "google" });
        }
      }
    }

    // Local DB Fallback
    const localPlaces = await prisma.place.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: input, mode: "insensitive" } },
          { city: { contains: input, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, city: true, slug: true },
      take: 8,
    });

    const suggestions = localPlaces.map((p) => ({
      id: p.id,
      slug: p.slug,
      text: `${p.name}, ${p.city}`,
      mainText: p.name,
      secondaryText: p.city,
    }));

    return NextResponse.json({ suggestions, source: "local" });
  } catch (error) {
    console.error("[autocomplete GET]", error);
    return NextResponse.json({ error: "Failed to fetch autocomplete suggestions" }, { status: 500 });
  }
}
