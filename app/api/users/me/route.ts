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

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: session.user.id }, ...(session.user.email ? [{ email: session.user.email }] : [])], deletedAt: null },
      select: {
        id:           true,
        name:         true,
        email:        true,
        image:        true,
        bio:          true,
        city:         true,
        role:         true,
        passwordHash: true,
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

    if (!user) {
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "user@example.com",
          image: session.user.image || null,
          bio: null,
          city: "India",
          role: session.user.role || "USER",
          hasPassword: false,
          createdAt: new Date().toISOString(),
          _count: { reviews: 0, favorites: 0, photos: 0 },
          reviews: [],
          favorites: [],
        },
      });
    }

    const { passwordHash, ...userClean } = user;
    return NextResponse.json({
      user: {
        ...userClean,
        hasPassword: Boolean(passwordHash),
      },
    });
  } catch (error) {
    console.warn("[users/me/GET] DB fetch warning:", error);
    const session = await auth().catch(() => null);
    if (session?.user?.id) {
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "user@example.com",
          image: session.user.image || null,
          bio: null,
          city: "India",
          role: session.user.role || "USER",
          hasPassword: false,
          createdAt: new Date().toISOString(),
          _count: { reviews: 0, favorites: 0, photos: 0 },
          reviews: [],
          favorites: [],
        },
      });
    }
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

    const userId = session.user.id;
    const userEmail = session.user.email || `${userId}@yelpindia.local`;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userEmail }] },
    });

    let updated;
    if (existing) {
      updated = await prisma.user.update({
        where: { id: existing.id },
        data:  {
          ...(name  !== undefined ? { name  } : {}),
          ...(bio   !== undefined ? { bio   } : {}),
          ...(city  !== undefined ? { city  } : {}),
          ...(image !== undefined ? { image } : {}),
        },
        select: { id: true, name: true, email: true, image: true, bio: true, city: true, role: true },
      });
    } else {
      updated = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: name || session.user.name || userEmail.split("@")[0],
          bio: bio || null,
          city: city || null,
          image: image || session.user.image || null,
          role: "USER",
        },
        select: { id: true, name: true, email: true, image: true, bio: true, city: true, role: true },
      });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[users/me/PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
