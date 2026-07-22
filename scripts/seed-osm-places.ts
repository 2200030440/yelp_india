// scripts/seed-osm-places.ts
// 100% Free & Open-Source Seeding Script using Overpass API (OpenStreetMap) & Nominatim
// No API Keys required, no billing, unlimited usage.
// Run with: npx tsx scripts/seed-osm-places.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INDIAN_CITIES = [
  { name: "Mumbai",        lat: 19.0760, lng: 72.8777, bbox: [18.95, 72.80, 19.15, 72.95] },
  { name: "New Delhi",     lat: 28.6139, lng: 77.2090, bbox: [28.50, 77.10, 28.75, 77.30] },
  { name: "Bengaluru",     lat: 12.9716, lng: 77.5946, bbox: [12.88, 77.50, 13.08, 77.70] },
  { name: "Chennai",       lat: 13.0827, lng: 80.2707, bbox: [12.95, 80.18, 13.15, 80.30] },
  { name: "Hyderabad",     lat: 17.3850, lng: 78.4867, bbox: [17.30, 78.35, 17.50, 78.55] },
  { name: "Kolkata",       lat: 22.5726, lng: 88.3639, bbox: [22.45, 88.28, 22.65, 88.45] },
  { name: "Pune",          lat: 18.5204, lng: 73.8567, bbox: [18.45, 73.78, 18.60, 73.92] },
  { name: "Jaipur",        lat: 26.9124, lng: 75.7873, bbox: [26.83, 75.72, 26.98, 75.88] },
  { name: "Goa",           lat: 15.2993, lng: 74.1240, bbox: [15.20, 73.75, 15.60, 74.10] },
];

const CUISINE_IMAGES: Record<string, string[]> = {
  "north-indian": [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80",
  ],
  "south-indian": [
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
  ],
  "cafe": [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  ],
  "biryani": [
    "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&q=80",
  ],
  "default": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  ],
};

function slugify(text: string, id: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}-${id.slice(-6)}`;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    cuisine?: string;
    "addr:street"?: string;
    "addr:suburb"?: string;
    "addr:city"?: string;
    phone?: string;
    website?: string;
  };
}

async function fetchOSMPlaces(bbox: number[]) {
  const [minLat, minLng, maxLat, maxLng] = bbox;
  const query = `[out:json][timeout:25];(node["amenity"~"restaurant|cafe|fast_food|pub|bar"]["name"](${minLat},${minLng},${maxLat},${maxLng});way["amenity"~"restaurant|cafe|fast_food|pub|bar"]["name"](${minLat},${minLng},${maxLat},${maxLng}););out center 20;`;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "YelpIndiaSeeder/1.0 (contact@yelpindia.in)",
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return (json.elements || []) as OverpassElement[];
}

async function main() {
  console.log("🚀 Seeding places from OpenStreetMap (Overpass API - 100% Free)...");

  // Ensure default categories exist
  const categories = [
    { name: "North Indian", slug: "north-indian" },
    { name: "South Indian", slug: "south-indian" },
    { name: "Cafes & Bakeries", slug: "cafes-bakeries" },
    { name: "Biryani & Kebabs", slug: "biryani-specialty" },
    { name: "Street Food", slug: "street-food" },
    { name: "Pubs & Bars", slug: "pubs-bars" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    categoryMap.set(cat.slug, existing.id);
  }

  // Ensure system user for photo creation
  const systemUser = await prisma.user.upsert({
    where: { email: "system@yelpindia.in" },
    update: {},
    create: {
      email: "system@yelpindia.in",
      name: "System Bot",
      role: "ADMIN",
    },
  });

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const city of INDIAN_CITIES) {
    console.log(`\n📍 Fetching OpenStreetMap places for ${city.name}...`);
    try {
      const elements = await fetchOSMPlaces(city.bbox);
      console.log(`   Found ${elements.length} places in ${city.name} via Overpass API`);

      for (const el of elements) {
        const name = el.tags?.name;
        if (!name) continue;

        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) continue;

        const osmId = `osm-${el.type}-${el.id}`;
        const slug = slugify(name, `${el.id}`);

        const existing = await prisma.place.findFirst({
          where: { OR: [{ googlePlaceId: osmId }, { slug }] },
          select: { id: true },
        });

        if (existing) {
          totalSkipped++;
          continue;
        }

        const street = el.tags?.["addr:street"] ?? el.tags?.["addr:suburb"] ?? "";
        const address = street ? `${street}, ${city.name}, India` : `${city.name}, India`;
        const amenity = el.tags?.amenity ?? "restaurant";

        let catSlug = "north-indian";
        if (amenity === "cafe") catSlug = "cafes-bakeries";
        else if (amenity === "pub" || amenity === "bar") catSlug = "pubs-bars";

        const categoryId = categoryMap.get(catSlug) ?? categoryMap.get("north-indian")!;
        const rating = Number((4.0 + Math.random() * 0.9).toFixed(1));
        const reviewCount = Math.floor(25 + Math.random() * 450);
        const priceLevel = Math.floor(1 + Math.random() * 3);

        const createdPlace = await prisma.place.create({
          data: {
            name,
            slug,
            address,
            city: city.name,
            state: "India",
            country: "India",
            latitude: lat,
            longitude: lng,
            priceLevel,
            phone: el.tags?.phone || null,
            website: el.tags?.website || null,
            averageRating: rating,
            reviewCount,
            googlePlaceId: osmId,
            isVerified: true,
            isFeatured: Math.random() > 0.7,
            categoryId,
          },
        });

        // Add a photo
        const photoList = CUISINE_IMAGES[catSlug] || CUISINE_IMAGES["default"];
        const photoUrl = photoList[Math.floor(Math.random() * photoList.length)];

        await prisma.photo.create({
          data: {
            url: photoUrl,
            caption: `${name} in ${city.name}`,
            isPrimary: true,
            placeId: createdPlace.id,
            userId: systemUser.id,
          },
        });

        totalInserted++;
      }
    } catch (err) {
      console.error(`⚠️ Error fetching ${city.name}:`, err);
    }

    // 1.5s rate-limit pause for Overpass API
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log(`\n✅ Finished OSM Seeding! Inserted: ${totalInserted}, Skipped: ${totalSkipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
