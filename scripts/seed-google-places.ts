// scripts/seed-google-places.ts
// Bulk-seeds restaurants from 30 major Indian cities via Google Places API (New v1).
// Run with: npm run seed:cities

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

const INDIAN_CITIES = [
  { name: "Mumbai",            lat: 19.0760, lng: 72.8777 },
  { name: "New Delhi",         lat: 28.6139, lng: 77.2090 },
  { name: "Bengaluru",         lat: 12.9716, lng: 77.5946 },
  { name: "Chennai",           lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad",         lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata",           lat: 22.5726, lng: 88.3639 },
  { name: "Pune",              lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad",         lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur",            lat: 26.9124, lng: 75.7873 },
  { name: "Surat",             lat: 21.1702, lng: 72.8311 },
  { name: "Lucknow",           lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur",            lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur",            lat: 21.1458, lng: 79.0882 },
  { name: "Indore",            lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal",            lat: 23.2599, lng: 77.4126 },
  { name: "Visakhapatnam",     lat: 17.6868, lng: 83.2185 },
  { name: "Patna",             lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara",          lat: 22.3072, lng: 73.1812 },
  { name: "Goa",               lat: 15.2993, lng: 74.1240 },
  { name: "Amritsar",          lat: 31.6340, lng: 74.8723 },
  { name: "Kochi",             lat:  9.9312, lng: 76.2673 },
  { name: "Chandigarh",        lat: 30.7333, lng: 76.7794 },
  { name: "Coimbatore",        lat: 11.0168, lng: 76.9558 },
  { name: "Agra",              lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi",          lat: 25.3176, lng: 82.9739 },
  { name: "Mysuru",            lat: 12.2958, lng: 76.6394 },
  { name: "Udaipur",           lat: 24.5854, lng: 73.7125 },
  { name: "Kolhapur",          lat: 16.7050, lng: 74.2433 },
  { name: "Thane",             lat: 19.2183, lng: 72.9781 },
  { name: "Pimpri-Chinchwad",  lat: 18.6298, lng: 73.7997 },
];

interface NewPlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string; // "PRICE_LEVEL_INEXPENSIVE" etc.
  photos?: Array<{ name: string }>;
  types?: string[];
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
    case "PRICE_LEVEL_FREE":          return 1;
    case "PRICE_LEVEL_INEXPENSIVE":   return 1;
    case "PRICE_LEVEL_MODERATE":      return 2;
    case "PRICE_LEVEL_EXPENSIVE":     return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":return 4;
    default: return 2;
  }
}

function extractCity(address: string, fallback: string): string {
  const parts = address.split(",");
  if (parts.length >= 3) return parts[parts.length - 3].trim();
  return fallback;
}

function getPhotoUrl(photoName: string): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&key=${GOOGLE_API_KEY}`;
}

async function fetchPlacesForCity(
  city: { name: string; lat: number; lng: number },
): Promise<NewPlaceResult[]> {
  const body = {
    locationRestriction: {
      circle: {
        center: { latitude: city.lat, longitude: city.lng },
        radius: 10000,
      },
    },
    includedTypes: ["restaurant"],
    maxResultCount: 20,
  };

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.types",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    console.warn(`  ⚠️  ${city.name}: ${data.error.status} — ${data.error.message}`);
    return [];
  }

  return data.places ?? [];
}

async function seedCity(city: { name: string; lat: number; lng: number }, adminId: string) {
  console.log(`\n📍 Seeding ${city.name}...`);
  const places = await fetchPlacesForCity(city);
  console.log(`   Found ${places.length} restaurants from Google`);

  let created = 0;
  let skipped = 0;

  for (const p of places) {
    const name = p.displayName?.text;
    if (!name) continue;

    const slug = slugify(name, p.id);
    const address = p.formattedAddress ?? `${city.name}, India`;
    const cityName = extractCity(address, city.name);
    const photoUrl = p.photos?.[0]
      ? getPhotoUrl(p.photos[0].name)
      : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

    try {
      const existing = await prisma.place.findFirst({
        where: { googlePlaceId: p.id },
        select: { id: true },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Map place types to category
      const types = p.types ?? [];
      let catSlug = "north-indian";
      if (types.includes("bakery"))      catSlug = "bakery";
      else if (types.includes("cafe"))   catSlug = "cafe";
      else if (types.includes("bar"))    catSlug = "bar";

      await prisma.place.create({
        data: {
          name,
          slug,
          address,
          city: cityName,
          state: city.name,
          latitude: p.location?.latitude ?? city.lat,
          longitude: p.location?.longitude ?? city.lng,
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
      });
      created++;
    } catch (err) {
      console.warn(`   ⚠️  Failed ${name}:`, (err as Error).message?.slice(0, 80));
    }

    await new Promise((r) => setTimeout(r, 30));
  }

  console.log(`   ✅ Created: ${created}  Skipped (already exist): ${skipped}`);
}

async function main() {
  console.log("🚀 Bulk Google Places seeding — 30 Indian cities");
  console.log(`   API Key: ${GOOGLE_API_KEY ? "✅ Set" : "❌ Missing!"}`);

  if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_PLACES_API_KEY not set. Exiting.");
    process.exit(1);
  }

  // Ensure categories exist
  const cats = [
    { slug: "north-indian", name: "North Indian", icon: "🍛" },
    { slug: "south-indian", name: "South Indian", icon: "🥘" },
    { slug: "cafe",         name: "Café",          icon: "☕" },
    { slug: "bakery",       name: "Bakery",        icon: "🧁" },
    { slug: "bar",          name: "Bar & Grill",   icon: "🍺" },
    { slug: "street-food",  name: "Street Food",   icon: "🌮" },
    { slug: "biryani",      name: "Biryani",       icon: "🍚" },
    { slug: "fine-dining",  name: "Fine Dining",   icon: "🥂" },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log("✅ Categories ready");

  // Ensure admin user exists so we have a valid user ID for place photos
  const admin = await prisma.user.upsert({
    where: { email: "admin@yelpindia.com" },
    update: {},
    create: {
      name: "Yelp Admin",
      email: "admin@yelpindia.com",
      role: "ADMIN",
      city: "Mumbai",
      bio: "Yelp India platform administrator",
    },
  });

  const before = await prisma.place.count();
  console.log(`📊 Places in DB before seeding: ${before}`);

  for (const city of INDIAN_CITIES) {
    await seedCity(city, admin.id);
    await new Promise((r) => setTimeout(r, 400));
  }

  const after = await prisma.place.count();
  console.log(`\n🎉 Done! Restaurants in DB: ${after}  (+${after - before} new)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
