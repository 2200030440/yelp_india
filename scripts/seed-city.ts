// scripts/seed-city.ts
// Automated City Seeder: Automatically fetches real restaurants from OpenStreetMap
// Usage: npx tsx scripts/seed-city.ts <cityName>
// Example: npm run seed:city hyderabad
// Example: npm run seed:city mumbai
// Example: npm run seed:city bengaluru

import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

// Curated HD photos by cuisine category so every place gets a distinct, beautiful photo
const CUISINE_PHOTOS: Record<string, string[]> = {
  "north-indian": [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=1200&q=80",
  ],
  "south-indian": [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80",
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
  ],
  "cafes-bakeries": [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
  ],
  "biryani-specialty": [
    "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=1200&q=80",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80",
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=80",
  ],
  "pubs-bars": [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
  ],
  "fine-dining": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  ],
  "street-food": [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=80",
    "https://images.unsplash.com/photo-1626777553634-517855018a38?w=1200&q=80",
  ],
};

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80",
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&q=80",
];

async function geocodeCity(cityName: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)},India&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "YelpIndiaSeeder/1.0" } });
  if (!res.ok) throw new Error(`Failed to geocode city ${cityName}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`City "${cityName}" not found in geocoding service.`);
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  const bbox = data[0].boundingbox ? data[0].boundingbox.map(parseFloat) : [lat - 0.1, lat + 0.1, lon - 0.1, lon + 0.1];
  return { lat, lon, bbox, displayName: data[0].display_name };
}

async function fetchOsmRestaurants(lat: number, lon: number) {
  const overpassQuery = `[out:json][timeout:15];node["amenity"~"restaurant|cafe|pub|fast_food"](around:5000,${lat},${lon});out body 40;`;

  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "YelpIndiaSeeder/1.0" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.elements) return data.elements;
      }
    } catch {
      /* Try next endpoint */
    }
  }

  throw new Error("Unable to reach OpenStreetMap Overpass servers. Please try again in a few seconds.");
}

async function main() {
  const rawCityInput = process.argv[2] || "Hyderabad";
  const cityFormatted = rawCityInput.charAt(0).toUpperCase() + rawCityInput.slice(1).toLowerCase();

  console.log(`\n🌆 Automated Seeding for City: ${cityFormatted.toUpperCase()}...`);
  console.log(`📡 Fetching live geographic coordinates from Nominatim...`);

  const { lat, lon } = await geocodeCity(cityFormatted);
  console.log(`📍 Found ${cityFormatted} coordinates: (${lat.toFixed(4)}, ${lon.toFixed(4)})`);

  console.log(`🔍 Querying live real restaurants from OpenStreetMap...`);
  const elements = await fetchOsmRestaurants(lat, lon);
  console.log(`✨ Discovered ${elements.length} real places in ${cityFormatted}!`);

  // Setup Categories
  const categories = [
    { name: "North Indian", slug: "north-indian" },
    { name: "South Indian", slug: "south-indian" },
    { name: "Cafes & Bakeries", slug: "cafes-bakeries" },
    { name: "Biryani & Kebabs", slug: "biryani-specialty" },
    { name: "Street Food", slug: "street-food" },
    { name: "Pubs & Bars", slug: "pubs-bars" },
    { name: "Fine Dining", slug: "fine-dining" },
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

  const systemUser = await prisma.user.upsert({
    where: { email: "system@yelpindia.in" },
    update: {},
    create: { email: "system@yelpindia.in", name: "System Bot", role: "ADMIN" },
  });

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const name = el.tags?.name || el.tags?.["name:en"];
    if (!name || name.length < 3) continue;

    const baseSlug = slugify(`${name}-${cityFormatted}`);
    const amenity = el.tags?.amenity || "restaurant";
    const cuisineTag = (el.tags?.cuisine || "").toLowerCase();

    let catSlug = "north-indian";
    if (cuisineTag.includes("south_indian") || cuisineTag.includes("dosa")) catSlug = "south-indian";
    else if (cuisineTag.includes("biryani") || cuisineTag.includes("kebab")) catSlug = "biryani-specialty";
    else if (amenity === "cafe" || cuisineTag.includes("bakery") || cuisineTag.includes("coffee")) catSlug = "cafes-bakeries";
    else if (amenity === "pub" || amenity === "bar") catSlug = "pubs-bars";

    const categoryId = categoryMap.get(catSlug) ?? categoryMap.get("north-indian")!;
    const street = el.tags?.["addr:street"] || el.tags?.["addr:suburb"] || el.tags?.["addr:full"] || `${name} Main Road`;
    const postcode = el.tags?.["addr:postcode"] || "500001";
    const phone = el.tags?.phone || el.tags?.["contact:phone"] || null;
    const priceLevel = Math.floor(1 + Math.random() * 3);

    const existing = await prisma.place.findFirst({
      where: { OR: [{ slug: baseSlug }, { name, city: cityFormatted }] },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    const place = await prisma.place.create({
      data: {
        name,
        slug: baseSlug,
        description: `${name} is a popular ${amenity} located in ${cityFormatted}, serving authentic dishes and delicious food.`,
        address: `${street}, ${cityFormatted}`,
        city: cityFormatted,
        state: "India",
        country: "India",
        postalCode: postcode,
        latitude: el.lat,
        longitude: el.lon,
        priceLevel,
        phone,
        averageRating: 0.0,
        reviewCount: 0,
        googlePlaceId: `osm-${el.id}`,
        isVerified: true,
        isFeatured: false,
        categoryId,
      },
    });

    // Select distinct photo for cuisine
    const pool = CUISINE_PHOTOS[catSlug] || DEFAULT_PHOTOS;
    const photoUrl = pool[i % pool.length];

    await prisma.photo.create({
      data: {
        url: photoUrl,
        caption: `${name} - ${cityFormatted}`,
        isPrimary: true,
        placeId: place.id,
        userId: systemUser.id,
      },
    });

    createdCount++;
    console.log(`  ✓ Imported: ${name} (${street})`);
  }

  console.log(`\n🎉 Automated City Seeding Finished for ${cityFormatted.toUpperCase()}!`);
  console.log(`   Imported: ${createdCount} new real restaurants`);
  console.log(`   Skipped: ${skippedCount} existing places\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error in automated city seeder:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
