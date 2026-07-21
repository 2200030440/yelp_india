// app/api/users/me/route.ts
// GET   /api/users/me — current user profile + reviews + stats
// PATCH /api/users/me — update profile (name, bio, city, image)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where:   { id: session.user.id, deletedAt: null },
      select: {
        id:           true,
        name:         true,
        email:        true,
        image:        true,
        bio:          true,
        city:         true,
        role:         true,
        createdAt:    true,
        _count: {
          select: {
            reviews:   { where: { deletedAt: null } },
            favorites: true,
            photos:    { where: { deletedAt: null } },
          },
        },
        reviews: {
          where:   { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take:    10,
          include: {
            place: {
              select: {
                id:    true,
                name:  true,
                slug:  true,
                city:  true,
                photos: {
                  where:  { isPrimary: true, deletedAt: null },
                  take:   1,
                  select: { url: true },
                },
              },
            },
          },
        },
        favorites: {
          orderBy: { createdAt: "desc" },
          take:    6,
          include: {
            place: {
              select: {
                id:           true,
                name:         true,
                slug:         true,
                city:         true,
                averageRating: true,
                category:     { select: { name: true } },
                photos: {
                  where:  { isPrimary: true, deletedAt: null },
                  take:   1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[users/me/GET]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, city, image } = body;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data:  {
        ...(name  !== undefined ? { name  } : {}),
        ...(bio   !== undefined ? { bio   } : {}),
        ...(city  !== undefined ? { city  } : {}),
        ...(image !== undefined ? { image } : {}),
      },
      select: { id: true, name: true, email: true, image: true, bio: true, city: true, role: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[users/me/PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
