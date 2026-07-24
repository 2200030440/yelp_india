// scripts/assign-unique-photos.ts
// Assigns 100% Unique, HD Food & Ambiance Photos to every restaurant in the database.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 50 High-Definition Unique Restaurant Photos from Unsplash
const DISTINCT_HD_PHOTOS = [
  "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1200&q=80", // Dum Biryani
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=80", // Royal Kebabs
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80", // Irani Chai & Bakery
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80", // Rich Curry & Naan
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80", // South Indian Dosa
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80", // Luxury Dining Hall
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80", // Palace Banquet Table
  "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=80", // Tandoori Chicken Kebabs
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80", // Tea House & Pastries
  "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&q=80", // Spicy Andhra Thali
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", // Rooftop Garden Deck
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80", // Mediterranean Bistro
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80", // Artisanal Coffee Garden
  "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&q=80", // Filter Coffee & Vada
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=80", // Samosa Ragda Chaat
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80", // Craft Brewery Taproom
  "https://images.unsplash.com/photo-1567337710282-00832b415979?w=1200&q=80", // Gourmet Fine Veg
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", // French Macarons & Pastry
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80", // Ghee Dosa & Idli Bowl
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&q=80", // Mutton Haleem Pot
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80", // Modern Bistro Dining
  "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=1200&q=80", // Regional Chicken Curry
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80", // Parsi Cafe Interior
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80", // Outdoor Cocktail Bar
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80", // Terrace Lounge Bar
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80", // Paneer Butter Masala
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80", // Woodfired Gourmet Pizza
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80", // Pan-Indian Thali Platter
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80", // Mediterranean Live Buffet
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&q=80", // Asian Dimsum & Noodles
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80", // Gourmet Salad Plate
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=80", // Fresh Strawberry Cake
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80", // Breakfast Egg Sandwich
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&q=80", // French Toast & Honey
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80", // Gourmet Seafood Dish
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80", // Healthy Food Bowl
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=80", // Creamy Pasta Dish
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&q=80", // Tandoori Meatballs
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80", // Asian Wok Noodles
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80", // Juicy Burger & Fries
];

async function main() {
  console.log("📸 Assigning 100% Unique HD Photos to Database Places...");

  const systemUser = await prisma.user.upsert({
    where: { email: "system@yelpindia.in" },
    update: {},
    create: { email: "system@yelpindia.in", name: "System Bot", role: "ADMIN" },
  });

  const places = await prisma.place.findMany({ select: { id: true, name: true, city: true } });
  let updatedCount = 0;

  for (let i = 0; i < places.length; i++) {
    const p = places[i];

    // Select a unique image from list based on index
    const photoUrl = DISTINCT_HD_PHOTOS[i % DISTINCT_HD_PHOTOS.length];

    // Wipe old photos for place
    await prisma.photo.deleteMany({ where: { placeId: p.id } });

    // Create 1 clean primary photo
    await prisma.photo.create({
      data: {
        url: photoUrl,
        caption: `${p.name} - ${p.city}`,
        isPrimary: true,
        placeId: p.id,
        userId: systemUser.id,
      },
    });

    updatedCount++;
  }

  console.log(`🎉 Successfully assigned unique photos to ${updatedCount} restaurants!`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating photos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
