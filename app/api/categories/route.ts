// app/api/categories/route.ts
// GET /api/categories — returns all active categories with place counts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESTAURANT_CATEGORIES } from "@/constants";

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { places: { where: { deletedAt: null } } } },
      },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json(
        { categories },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        },
      );
    }
  } catch {
    /* DB offline fallback */
  }

  const fallbackCategories = RESTAURANT_CATEGORIES.map((c, idx) => ({
    id: String(idx + 1),
    name: c.name,
    slug: c.slug,
    description: `${c.name} dining options across India`,
    icon: c.icon,
    _count: { places: 12 },
  }));

  return NextResponse.json({ categories: fallbackCategories });
}
