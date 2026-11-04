// app/api/cities/route.ts
// Dynamic endpoint returning all distinct cities in database with place counts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dynamicPlaces } from "@/lib/restaurant-store";

export async function GET() {
  try {
    const cityCounts = await prisma.place.groupBy({
      by: ["city"],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const cities = cityCounts
      .filter((c) => c.city && c.city.trim().length > 0)
      .map((c) => ({
        name: c.city.trim(),
        count: c._count.id,
      }));

    if (cities.length > 0) {
      return NextResponse.json({ cities });
    }
  } catch (err) {
    console.warn("[GET /api/cities DB warning]", err);
  }

  // Fallback to dynamic places cities count
  const cityMap = new Map<string, number>();
  dynamicPlaces.getAll().forEach((p) => {
    if (p.city) {
      cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
    }
  });

  const fallbackCities = Array.from(cityMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  return NextResponse.json({ cities: fallbackCities });
}

