// app/api/cities/route.ts
// Dynamic endpoint returning all distinct cities in database with place counts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("[GET /api/cities error]", err);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
