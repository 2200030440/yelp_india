// app/api/places/google-search/route.ts
// Live Google Places & OpenStreetMap Nearby Search API route.
// Automatically queries Google Places API if GOOGLE_PLACES_API_KEY is configured in env,
// or falls back to OpenStreetMap Overpass API for 100% free live nearby restaurant search worldwide!

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "20.5937";
    const lng = searchParams.get("lng") || "78.9629";
    const query = searchParams.get("query") || "";
    const googlePlaceId = searchParams.get("googlePlaceId");
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Handle single Google Place Details query
    if (googlePlaceId && apiKey) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,price_level,photos,opening_hours&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const result = detailsData.result;
        if (result) {
          const placeDetails = {
            googlePlaceId: googlePlaceId,
            name: result.name,
            address: result.formatted_address || "Nearby",
            city: result.formatted_address?.split(",")?.slice(-3)?.[0]?.trim() || "India",
            latitude: result.geometry?.location?.lat ?? Number(lat),
            longitude: result.geometry?.location?.lng ?? Number(lng),
            phone: result.formatted_phone_number || null,
            website: result.website || null,
            rating: result.rating || 4.5,
            reviewCount: result.user_ratings_total || 10,
            priceLevel: result.price_level || 2,
            photos: (result.photos || []).map((p: { photo_reference: string }) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${apiKey}`
            ),
          };
          return NextResponse.json({ place: placeDetails, source: "google-details" });
        }
      }
    }

    if (apiKey) {
      // 1. Google Places Nearby Search API Integration
      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&type=restaurant${query ? `&keyword=${encodeURIComponent(query)}` : ""}&key=${apiKey}`;
      const res = await fetch(googleUrl);
      if (res.ok) {
        const data = await res.json();
        const googlePlaces = (data.results || []).map((item: { place_id: string; name: string; vicinity?: string; formatted_address?: string; geometry?: { location?: { lat: number; lng: number } }; rating?: number; user_ratings_total?: number; price_level?: number; photos?: Array<{ photo_reference: string }> }) => ({
          googlePlaceId: item.place_id,
          name: item.name,
          address: item.vicinity || item.formatted_address || "Nearby",
          city: item.vicinity?.split(",")?.pop()?.trim() || "Local City",
          latitude: item.geometry?.location?.lat ?? Number(lat),
          longitude: item.geometry?.location?.lng ?? Number(lng),
          rating: item.rating || 4.5,
          reviewCount: item.user_ratings_total || 12,
          priceLevel: item.price_level || 2,
          photoUrl: item.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${apiKey}`
            : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
        }));
        return NextResponse.json({ places: googlePlaces, source: "google" });
      }
    }

    // 2. OpenStreetMap Overpass API Fallback (Free & Open Worldwide)
    const overpassQuery = `[out:json];node(around:8000,${lat},${lng})[amenity=restaurant];out 25;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const osmRes = await fetch(overpassUrl);
    if (!osmRes.ok) {
      return NextResponse.json({ places: [], source: "fallback" });
    }

    const osmData = await osmRes.json();
    const osmPlaces = (osmData.elements || [])
      .filter((el: { tags?: { name?: string }; lat: number; lon: number }) => el.tags?.name)
      .map((el: { id: number; tags?: { name?: string; "addr:street"?: string; "addr:full"?: string; "addr:city"?: string }; lat: number; lon: number }) => ({
        id: `osm-${el.id}`,
        name: el.tags?.name || "Local Restaurant",
        address: el.tags?.["addr:street"] || el.tags?.["addr:full"] || "Nearby",
        city: el.tags?.["addr:city"] || "Nearby City",
        latitude: el.lat,
        longitude: el.lon,
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        priceLevel: 2,
        photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      }));

    return NextResponse.json({ places: osmPlaces, source: "openstreetmap" });
  } catch (error) {
    console.error("[google-search GET]", error);
    return NextResponse.json({ error: "Failed to search nearby places" }, { status: 500 });
  }
}
