// lib/osm.ts
// 100% Free OpenStreetMap & Nominatim & Overpass API Utilities
// No API Keys required, 0 billing cost.

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  city: string;
  state?: string;
}

export interface OSMPlace {
  id: string;
  name: string;
  amenity: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
}

/**
 * Free forward geocoding using Nominatim (OpenStreetMap)
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ", India",
    )}&countrycodes=in&limit=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "YelpIndiaApp/1.0",
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: item.display_name.split(",")[0]?.trim() || query,
    }));
  } catch (err) {
    console.error("[Nominatim Geocode Error]", err);
    return [];
  }
}

/**
 * Free reverse geocoding using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "YelpIndiaApp/1.0",
      },
    });

    if (!res.ok) return "Current Location";

    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.suburb ||
      data.address?.state_district ||
      "Current Location"
    );
  } catch {
    return "Current Location";
  }
}

/**
 * Fetch nearby places live via Overpass API (OpenStreetMap)
 */
export async function fetchNearbyOSMPlaces(
  lat: number,
  lng: number,
  radiusMeters = 3000,
): Promise<OSMPlace[]> {
  try {
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"restaurant|cafe|fast_food|pub|bar"]["name"](around:${radiusMeters},${lat},${lng});
      );
      out body 20;
    `;

    const url = "https://overpass-api.de/api/interpreter";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.elements || []).map((el: any) => ({
      id: `osm-${el.id}`,
      name: el.tags?.name || "Restaurant",
      amenity: el.tags?.amenity || "restaurant",
      lat: el.lat,
      lng: el.lon,
      address: el.tags?.["addr:street"] || "Nearby Spot",
      city: el.tags?.["addr:city"] || "Local Area",
    }));
  } catch (err) {
    console.error("[Overpass API Error]", err);
    return [];
  }
}
