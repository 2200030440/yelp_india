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

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    // Fetch user from DB with passwordHash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // If user has no passwordHash set yet (e.g. Google OAuth user), set initial password directly
    if (!user.passwordHash) {
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedNew },
      });
      return NextResponse.json({
        success: true,
        message: "Password set successfully! Your account now has a password configured.",
      });
    }

    // User already has a password set — require currentPassword
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }

    // Verify current password against stored bcrypt hash
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "You entered the wrong password." }, { status: 400 });
    }

    // Hash & save new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("[users/password/POST]", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
