import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dynamicPlaces } from "@/lib/restaurant-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q          = searchParams.get("q") ?? "";
    const city       = searchParams.get("city") ?? "";
    const category   = searchParams.get("category") ?? "";
    const minRating  = parseFloat(searchParams.get("minRating") ?? "0");
    const priceLevel = parseInt(searchParams.get("priceLevel") ?? "0");
    const featured   = searchParams.get("featured") === "true";
    const sortBy     = searchParams.get("sort") ?? "rating";
    const page       = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit      = Math.min(50, parseInt(searchParams.get("limit") ?? "12"));
    const skip       = (page - 1) * limit;

    try {
      const where = {
        deletedAt: null,
        ...(q ? {
          OR: [
            { name:        { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { city:        { contains: q, mode: "insensitive" as const } },
            { state:       { contains: q, mode: "insensitive" as const } },
            { category: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        } : {}),
        ...(city && city !== "all" ? { city: { contains: city, mode: "insensitive" as const } } : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(minRating > 0   ? { averageRating: { gte: minRating } }  : {}),
        ...(priceLevel > 0  ? { priceLevel }                         : {}),
        ...(featured        ? { isFeatured: true }                   : {}),
      };

      const orderBy =
        sortBy === "rating"      ? { averageRating: "desc" as const } :
        sortBy === "reviewCount" ? { reviewCount:   "desc" as const } :
        sortBy === "price_asc"   ? { priceLevel:    "asc"  as const } :
        sortBy === "price_desc"  ? { priceLevel:    "desc" as const } :
        sortBy === "newest"      ? { createdAt:     "desc" as const } :
                                   { averageRating: "desc" as const };

      const [places, total] = await Promise.all([
        prisma.place.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: { select: { name: true, slug: true } },
            photos:   {
              where:   { deletedAt: null },
              orderBy: { isPrimary: "desc" },
              take:    1,
              select:  { url: true },
            },
            _count: { select: { reviews: { where: { deletedAt: null, isApproved: true } } } },
          },
        }),
        prisma.place.count({ where }),
      ]);

      if (places && places.length > 0) {
        return NextResponse.json({
          places,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
      }
    } catch {
      /* DB offline fallback */
    }

    // Dynamic fallback store bridge
    let all = dynamicPlaces.getAll();

    if (q) {
      const qLower = q.toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.city.toLowerCase().includes(qLower) ||
          (p.state && p.state.toLowerCase().includes(qLower)) ||
          p.category.name.toLowerCase().includes(qLower),
      );
    }

    if (city && city !== "all") {
      const cityLower = city.toLowerCase();
      all = all.filter((p) => p.city.toLowerCase() === cityLower);
    }

    if (category) {
      all = all.filter(
        (p) => p.category.slug.toLowerCase() === category.toLowerCase(),
      );
    }

    if (minRating > 0) {
      all = all.filter((p) => p.averageRating >= minRating);
    }

    if (priceLevel > 0) {
      all = all.filter((p) => p.priceLevel === priceLevel);
    }

    if (featured) {
      all = all.filter((p) => p.isFeatured);
    }

    if (sortBy === "rating") {
      all.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "reviewCount") {
      all.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === "newest") {
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = all.length;
    const paginated = all.slice(skip, skip + limit);

    return NextResponse.json({
      places: paginated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[places/GET]", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.city) {
      return NextResponse.json({ error: "Name and City are required" }, { status: 400 });
    }

    // Try DB insertion if available
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role === "ADMIN" || user?.role === "MODERATOR") {
          // ensure category exists or find default
          let categoryId = body.categoryId;
          if (!categoryId) {
            const firstCategory = await prisma.category.findFirst();
            if (firstCategory) categoryId = firstCategory.id;
          }

          if (categoryId) {
            const dbPlace = await prisma.place.create({
              data: {
                name: body.name,
                slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + body.city.toLowerCase(),
                address: body.address || body.city,
                city: body.city,
                state: body.state || "India",
                country: "India",
                postalCode: body.postalCode || null,
                latitude: body.latitude ?? null,
                longitude: body.longitude ?? null,
                priceLevel: body.priceLevel || 2,
                phone: body.phone || null,
                website: body.website || null,
                description: body.description || null,
                categoryId,
              },
            });
            // also sync with dynamic store
            dynamicPlaces.add(body);
            return NextResponse.json({ place: dbPlace }, { status: 201 });
          }
        }
      }
    } catch {
      /* DB offline fallback */
    }

    // Fallback insertion into dynamic store
    const newPlace = dynamicPlaces.add(body);
    return NextResponse.json({ place: newPlace }, { status: 201 });
  } catch (error) {
    console.error("[places/POST]", error);
    return NextResponse.json({ error: "Failed to create place" }, { status: 500 });
  }
}
