// app/api/favorites/route.ts
// GET    /api/favorites — current user's saved places
// POST   /api/favorites — save a place (accepts ID or slug)
// DELETE /api/favorites?placeId=xxx — unsave a place (accepts ID or slug)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        place: {
          include: {
            category: { select: { name: true, slug: true } },
            photos:   {
              where:   { deletedAt: null },
              orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
              take:    1,
              select:  { url: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("[favorites/GET]", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await request.json();
    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    // Resolve placeId if passed as slug
    const targetPlace = await prisma.place.findFirst({
      where: { OR: [{ id: placeId }, { slug: placeId }] },
      select: { id: true },
    });

    if (!targetPlace) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const favorite = await prisma.favorite.upsert({
      where:  { userId_placeId: { userId: session.user.id, placeId: targetPlace.id } },
      update: {},
      create: { userId: session.user.id, placeId: targetPlace.id },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("[favorites/POST]", error);
    return NextResponse.json({ error: "Failed to save place" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    // Resolve placeId if passed as slug
    const targetPlace = await prisma.place.findFirst({
      where: { OR: [{ id: placeId }, { slug: placeId }] },
      select: { id: true },
    });

    const targetId = targetPlace ? targetPlace.id : placeId;

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, placeId: targetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[favorites/DELETE]", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
