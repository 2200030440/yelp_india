// lib/utils.ts
// Utility functions shared across the application.
// Keep this file lean — only truly shared, stateless utilities.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names intelligently.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * Example: cn("px-2 py-1", condition && "bg-red-500", "px-4") → "py-1 bg-red-500 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a star rating display string.
 * Example: formatRating(4.567) → "4.6"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Formats a price level (1–4) into a dollar sign representation.
 * Consistent with Yelp/Google Maps conventions.
 */
export function formatPriceLevel(level: number): string {
  return "₹".repeat(Math.min(Math.max(level, 1), 4));
}

/**
 * Truncates a string to a max length with an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Converts a place name to a URL-friendly slug.
 * Example: "The Grand Café" → "the-grand-cafe"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Formats a date relative to now (e.g. "2 days ago", "just now").
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}d ago`;
  if (diffSeconds < 31536000)
    return `${Math.floor(diffSeconds / 2592000)} mo ago`;
  return `${Math.floor(diffSeconds / 31536000)}y ago`;
}

/**
 * Formats a number with Indian number system (e.g. 1,00,000).
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Generates a consistent color from a string (for avatar fallbacks, category badges, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * Capitalizes the first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}
