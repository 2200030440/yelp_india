// lib/cloudinary.ts
// Cloudinary SDK configuration + server-side utilities
// Used ONLY in server-side code (API routes, Server Actions)

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// ── Types ──────────────────────────────────────────────────────────────────
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a signed upload URL for client-side direct uploads.
 * The client gets the signature and uploads directly to Cloudinary
 * without the file ever touching our server.
 */
export function generateSignedUploadParams(folder: string = "yelp-india") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
    // Enforce safe transformations on upload
    transformation: "c_limit,w_1920,h_1080,q_auto:good,f_auto",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}

/**
 * Delete an asset from Cloudinary by its public_id.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch {
    return false;
  }
}
