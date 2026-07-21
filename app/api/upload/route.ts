// app/api/upload/route.ts
// Generates a signed Cloudinary upload signature.
// Client-side uploads go directly to Cloudinary (no file bytes on our server).

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Only authenticated users may upload
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const folder = body.folder ?? "yelp-india/places";

    const params = generateSignedUploadParams(folder);
    return NextResponse.json(params);
  } catch (error) {
    console.error("[upload/sign] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 },
    );
  }
}
