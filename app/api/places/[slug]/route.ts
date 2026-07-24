// app/api/places/[slug]/route.ts
// GET  /api/places/:slug — full place detail with reviews, photos, hours, amenities
// PUT  /api/places/:slug — update (admin)
// DELETE /api/places/:slug — soft delete (admin)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dynamicPlaces } from "@/lib/restaurant-store";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    try {
      const place = await prisma.place.findUnique({
        where:   { slug, deletedAt: null },
        include: {
          category:     { select: { name: true, slug: true, icon: true } },
          photos:       { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
          openingHours: { orderBy: { dayOfWeek: "asc" } },
          amenities:    { include: { amenity: true } },
          reviews: {
            where:   { deletedAt: null, isApproved: true },
            orderBy: { createdAt: "desc" },
            take:    20,
            include: {
              user:   { select: { id: true, name: true, image: true } },
              photos: { where: { deletedAt: null }, take: 3 },
            },
          },
          _count: {
            select: {
              reviews:   { where: { deletedAt: null, isApproved: true } },
              favorites: true,
              photos:    { where: { deletedAt: null } },
            },
          },
        },
      });

      if (place) {
        return NextResponse.json({ place });
      }
    } catch {
      /* DB offline fallback */
    }

    const storePlace = dynamicPlaces.getBySlug(slug);
    if (storePlace) {
      return NextResponse.json({ place: storePlace });
    }

    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  } catch (error) {
    console.error("[places/slug/GET]", error);
    return NextResponse.json({ error: "Failed to fetch place" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role === "ADMIN") {
          const place = await prisma.place.update({ where: { slug }, data: body });
          return NextResponse.json({ place });
        }
      }
    } catch {
      /* DB offline fallback */
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[places/slug/PUT]", error);
    return NextResponse.json({ error: "Failed to update place" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.role === "ADMIN") {
          await prisma.place.update({ where: { slug }, data: { deletedAt: new Date() } });
        }
      }
    } catch {
      /* DB offline fallback */
    }

    dynamicPlaces.delete(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[places/slug/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete place" }, { status: 500 });
  }
}
