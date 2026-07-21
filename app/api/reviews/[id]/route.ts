// app/api/reviews/[id]/route.ts
// GET    /api/reviews/:id  — fetch single review
// PUT    /api/reviews/:id  — edit review (owner or admin)
// DELETE /api/reviews/:id  — soft delete (owner or admin)
// POST   /api/reviews/:id/like — toggle like on a review

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where:   { id, deletedAt: null },
      include: { user: { select: { id: true, name: true, image: true } }, photos: true },
    });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("[reviews/id/GET]", error);
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const isOwner = review.userId === session.user.id;
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const updated = await prisma.review.update({
      where: { id },
      data:  { rating: body.rating, content: body.content },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error("[reviews/id/PUT]", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const isOwner = review.userId === session.user.id;
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });

    // Recalculate aggregates
    const aggregate = await prisma.review.aggregate({
      where:  { placeId: review.placeId, deletedAt: null, isApproved: true },
      _avg:   { rating: true },
      _count: { rating: true },
    });
    await prisma.place.update({
      where: { id: review.placeId },
      data:  {
        averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
        reviewCount:   aggregate._count.rating,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reviews/id/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
