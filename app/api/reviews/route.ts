// app/api/reviews/route.ts
// GET  /api/reviews?placeId=xxx — list approved reviews for a place
// POST /api/reviews            — create review (auth required, 1 per user per place)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    const userId  = searchParams.get("userId");
    const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
    const skip    = (page - 1) * limit;

    if (!placeId && !userId) {
      return NextResponse.json({ error: "placeId or userId required" }, { status: 400 });
    }

    const where = {
      deletedAt: null,
      isApproved: true,
      ...(placeId ? { placeId } : {}),
      ...(userId  ? { userId  } : {}),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user:   { select: { id: true, name: true, image: true } },
          photos: { where: { deletedAt: null }, take: 4 },
          _count: { select: { likes: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({ reviews, pagination: { page, limit, total } });
  } catch (error) {
    console.error("[reviews/GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to write a review" }, { status: 401 });
    }

    const body = await request.json();
    const { placeId, rating, content } = body;

    if (!placeId || !rating || !content) {
      return NextResponse.json({ error: "placeId, rating, and content are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }

    // Check for existing review from same user for same place
    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, placeId, deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this place" }, { status: 409 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId:  session.user.id,
        placeId,
        rating,
        content: content.trim(),
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // Recalculate place's averageRating + reviewCount
    const aggregate = await prisma.review.aggregate({
      where:   { placeId, deletedAt: null, isApproved: true },
      _avg:    { rating: true },
      _count:  { rating: true },
    });
    await prisma.place.update({
      where: { id: placeId },
      data:  {
        averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
        reviewCount:   aggregate._count.rating,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[reviews/POST]", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
