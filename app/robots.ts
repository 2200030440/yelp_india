// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/places", "/places/", "/search", "/map"],
        disallow:  ["/admin", "/api/", "/profile", "/saved"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
