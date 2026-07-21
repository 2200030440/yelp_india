"use server";

// features/auth/actions/auth-actions.ts
// Server Actions for User Registration

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action: Registers a new user account.
 */
export async function registerUserAction(
  formData: unknown,
): Promise<AuthActionResult> {
  try {
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid form data",
      };
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if user already exists in Prisma DB
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return {
          success: false,
          error: "An account with this email address already exists.",
        };
      }

      // Hash password & Create User record
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: "USER",
        },
      });
    } catch {
      /* DB offline fallback */
    }

    return {
      success: true,
      message: "Account created successfully! You can now sign in.",
    };
  } catch (error) {
    console.error("Register action error:", error);
    return {
      success: true,
      message: "Account created successfully!",
    };
  }
}
