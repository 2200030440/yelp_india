// prisma/seed/index.ts
// Database Seed Script for Yelp India

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Categories
  const categoriesData = [
    {
      name: "North Indian",
      slug: "north-indian",
      description: "Tandoori, Butter Chicken, Naan, Dal Makhani & Mughlai delights",
      icon: "Soup",
    },
    {
      name: "South Indian",
      slug: "south-indian",
      description: "Crispy Dosa, Fluffy Idlis, Vada & Filter Coffee",
      icon: "CookingPot",
    },
    {
      name: "Biryani & Kebabs",
      slug: "biryani-specialty",
      description: "Aromatic Hyderabadi, Lucknowi & Kolkata Biryanis with juicy Kebabs",
      icon: "Flame",
    },
    {
      name: "Fine Dining",
      slug: "fine-dining",
      description: "Luxury gourmet dining, curated multi-course menus & exceptional ambiance",
      icon: "UtensilsCrossed",
    },
    {
      name: "Cafes & Bakeries",
      slug: "cafes-bakeries",
      description: "Artisanal coffee, fresh pastries, sourdough toasts & relaxed vibes",
      icon: "Coffee",
    },
    {
      name: "Street Food",
      slug: "street-food",
      description: "Pani Puri, Chaat, Pav Bhaji, Vada Pav & Momos",
      icon: "Sandwich",
    },
  ];

  console.log("Seeding categories...");
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 2. Seed Admin User
  console.log("Seeding admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@yelpindia.com" },
    update: {},
    create: {
      name: "Yelp Admin",
      email: "admin@yelpindia.com",
      role: "ADMIN",
      city: "Mumbai",
    },
  });

  // 3. Seed Sample Restaurant
  const northIndianCat = await prisma.category.findUnique({
    where: { slug: "north-indian" },
  });

  if (northIndianCat) {
    console.log("Seeding sample restaurant...");
    const restaurant = await prisma.place.upsert({
      where: { slug: "bukhara-delhi" },
      update: {},
      create: {
        name: "Bukhara - ITC Maurya",
        slug: "bukhara-delhi",
        description:
          "World-renowned North Indian restaurant famous for Dal Bukhara and rustic tandoori dishes.",
        address: "ITC Maurya, Diplomatic Enclave, Chanakyapuri",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        latitude: 28.5976,
        longitude: 77.1724,
        priceLevel: 4,
        phone: "+91 11 2611 2233",
        website: "https://www.itchotels.com",
        averageRating: 4.9,
        reviewCount: 2847,
        isVerified: true,
        isFeatured: true,
        categoryId: northIndianCat.id,
      },
    });

    // Seed sample review
    await prisma.review.create({
      data: {
        userId: adminUser.id,
        placeId: restaurant.id,
        rating: 5,
        content:
          "Dal Bukhara cooked overnight for 18 hours is unmatched in rich flavor and tradition. Outstanding hospitality!",
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
