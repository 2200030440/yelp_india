// config/site.ts
// Site-wide configuration object.

import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/constants";

export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: APP_URL,
  ogImage: `${APP_URL}/og-image.png`,

  // Main navigation links
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Restaurants", href: "/places" },
    { title: "Search Food", href: "/search" },
  ],

  // Footer navigation groups
  footerNav: [
    {
      title: "Explore Cuisines",
      links: [
        { title: "North Indian", href: "/places?category=north-indian" },
        { title: "South Indian", href: "/places?category=south-indian" },
        { title: "Biryani & Kebabs", href: "/places?category=biryani-specialty" },
        { title: "Fine Dining", href: "/places?category=fine-dining" },
        { title: "Cafes & Bakeries", href: "/places?category=cafes-bakeries" },
      ],
    },
    {
      title: "Top Cities",
      links: [
        { title: "Mumbai Restaurants", href: "/places?city=Mumbai" },
        { title: "Delhi NCR Restaurants", href: "/places?city=Delhi" },
        { title: "Bengaluru Restaurants", href: "/places?city=Bengaluru" },
        { title: "Hyderabad Biryani", href: "/places?city=Hyderabad" },
        { title: "Chennai Eateries", href: "/places?city=Chennai" },
      ],
    },
    {
      title: "Account",
      links: [
        { title: "Login", href: "/login" },
        { title: "Sign Up", href: "/register" },
        { title: "My Profile", href: "/profile" },
        { title: "Saved Restaurants", href: "/saved" },
      ],
    },
    {
      title: "For Business",
      links: [
        { title: "Admin Portal", href: "/admin" },
        { title: "Add Your Restaurant", href: "/admin/places" },
        { title: "Review Moderation", href: "/admin/reviews" },
      ],
    },
  ],

  // Social links
  social: {
    twitter: "https://twitter.com/yelp_india",
    instagram: "https://instagram.com/yelp_india",
    linkedin: "https://linkedin.com/company/yelp-india",
  },
} as const;

export type SiteConfig = typeof siteConfig;
