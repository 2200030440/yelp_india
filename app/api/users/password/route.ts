// app/api/users/password/route.ts
// POST /api/users/password — Change password with bcrypt verification

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to change your password." }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current password and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    // Fetch user from DB with passwordHash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true, accounts: { select: { provider: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // Check if user registered via Google OAuth without a local password
    if (!user.passwordHash) {
      const isGoogleUser = user.accounts.some((a) => a.provider === "google");
      if (isGoogleUser) {
        return NextResponse.json(
          { error: "Your account uses Google Login. Password change is not applicable." },
          { status: 400 }
        );
      }
      // If no passwordHash yet, allow setting the new password directly
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedNew },
      });
      return NextResponse.json({ success: true, message: "Password updated successfully!" });
    }

    // Verify current password against stored bcrypt hash
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password does not match. Please try again." }, { status: 400 });
    }

    // Hash & save new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    console.error("[users/password/POST]", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
