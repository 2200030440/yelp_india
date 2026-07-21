// app/api/photos/route.ts
// Photo CRUD: GET (list photos for a place) + POST (save photo to DB) + DELETE (remove photo)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

// GET /api/photos?placeId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    const reviewId = searchParams.get("reviewId");

    if (!placeId && !reviewId) {
      return NextResponse.json(
        { error: "placeId or reviewId required" },
        { status: 400 },
      );
    }

    const photos = await prisma.photo.findMany({
      where: {
        ...(placeId ? { placeId } : {}),
        ...(reviewId ? { reviewId } : {}),
        deletedAt: null,
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("[photos/GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 },
    );
  }
}

// POST /api/photos — Save a successfully uploaded Cloudinary photo to the DB
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, publicId, caption, isPrimary, placeId, reviewId } = body;

    if (!url || !publicId) {
      return NextResponse.json(
        { error: "url and publicId are required" },
        { status: 400 },
      );
    }

    // If marking as primary, unset other primary photos for this place/review
    if (isPrimary && placeId) {
      await prisma.photo.updateMany({
        where: { placeId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        publicId,
        caption: caption ?? null,
        isPrimary: isPrimary ?? false,
        userId: session.user.id,
        placeId: placeId ?? null,
        reviewId: reviewId ?? null,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("[photos/POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 },
    );
  }
}

// DELETE /api/photos?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo id required" }, { status: 400 });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Only the owner or an admin may delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    const isOwner = photo.userId === session.user.id;
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft-delete in DB
    await prisma.photo.update({
      where: { id: photoId },
      data: { deletedAt: new Date() },
    });

    // Remove from Cloudinary (best effort)
    if (photo.publicId) {
      await deleteCloudinaryAsset(photo.publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[photos/DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 },
    );
  }
}
