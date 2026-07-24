// app/api/admin/users/route.ts
// Admin API endpoint for listing and managing registered users across Yelp India.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dynamicUsers, DynamicUserItem } from "@/lib/user-store";
import { getStateForCity } from "@/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { reviews: true } },
        accounts: { select: { provider: true } },
      },
    });

    const dbUsersFormatted: DynamicUserItem[] = dbUsers.map((u) => {
      const joinedDate = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Jan 2026";

      const hasGoogle = u.accounts.some((a) => a.provider === "google");
      const roleLabel: "Admin" | "Moderator" | "User" =
        u.role === "ADMIN" ? "Admin" : u.role === "MODERATOR" ? "Moderator" : "User";

      const cityVal = u.city || "Mumbai";
      const stateVal = getStateForCity(cityVal);

      return {
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        role: roleLabel,
        image: u.image || null,
        provider: hasGoogle ? "google" : "credentials",
        city: cityVal,
        state: stateVal,
        reviewsCount: u._count.reviews,
        joined: joinedDate,
        createdAt: u.createdAt.toISOString(),
      };
    });

    const fallbackUsers = dynamicUsers.getAll();
    const emailMap = new Map<string, DynamicUserItem>();

    dbUsersFormatted.forEach((u) => {
      emailMap.set(u.email.toLowerCase().trim(), u);
    });

    fallbackUsers.forEach((u) => {
      const emailKey = u.email.toLowerCase().trim();
      if (!emailMap.has(emailKey)) {
        emailMap.set(emailKey, u);
      }
    });

    const combinedUsers = Array.from(emailMap.values());
    combinedUsers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ users: combinedUsers });
  } catch (error) {
    console.error("[admin/users/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      console.warn("DB user delete skipped or failed:", err);
    }

    dynamicUsers.delete(userId);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[admin/users/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
