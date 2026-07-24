// app/api/admin/reviews/route.ts
// Admin API for fetching and managing all reviews directly from Prisma DB.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStateForCity } from "@/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        place: { select: { id: true, name: true, city: true, state: true } },
      },
    });

    const mapped = reviews.map((r) => {
      const city = r.place.city || "Mumbai";
      const state = r.place.state || getStateForCity(city);
      const timeAgo = r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently";

      return {
        id: r.id,
        user: r.user.name || r.user.email.split("@")[0],
        restaurant: r.place.name,
        city,
        state,
        rating: r.rating,
        comment: r.content,
        date: timeAgo,
        status: r.isApproved ? "Approved" : "Pending",
      };
    });

    return NextResponse.json({ reviews: mapped });
  } catch (error) {
    console.error("[admin/reviews/GET]", error);
    return NextResponse.json({ error: "Failed to fetch admin reviews", reviews: [] }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/reviews/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
