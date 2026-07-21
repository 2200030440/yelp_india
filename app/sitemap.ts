// app/sitemap.ts
// Auto-generated XML sitemap for SEO
// All static pages + dynamic place pages from DB

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/places`,  lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/search`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/map`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/login`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/register`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic place pages
  let placePages: MetadataRoute.Sitemap = [];
  try {
    const places = await prisma.place.findMany({
      where:  { deletedAt: null },
      select: { slug: true, updatedAt: true },
    });
    placePages = places.map((p) => ({
      url:             `${BASE_URL}/places/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch {
    // DB might not be available during build
  }

  return [...staticPages, ...placePages];
}
