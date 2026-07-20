// constants/index.ts
// Application-wide constants.
// Never use magic numbers or strings in components — import from here.

// -----------------------------------------------------------------
// App metadata
// -----------------------------------------------------------------
export const APP_NAME = "Yelp India" as const;
export const APP_DESCRIPTION =
  "Discover the best restaurants, food joints, cafes, and dining spots across India." as const;
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// -----------------------------------------------------------------
// Pagination defaults
// -----------------------------------------------------------------
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// -----------------------------------------------------------------
// Review constraints
// -----------------------------------------------------------------
export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 2000;
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// -----------------------------------------------------------------
// Photo constraints
// -----------------------------------------------------------------
export const MAX_PHOTOS_PER_PLACE = 20;
export const MAX_PHOTOS_PER_REVIEW = 5;
export const MAX_PHOTO_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

// -----------------------------------------------------------------
// Map defaults (centered on India)
// -----------------------------------------------------------------
export const DEFAULT_MAP_CENTER = {
  latitude: 20.5937,
  longitude: 78.9629,
} as const;
export const DEFAULT_MAP_ZOOM = 5;
export const PLACE_MAP_ZOOM = 15;

// -----------------------------------------------------------------
// Indian cities (for search suggestions)
// -----------------------------------------------------------------
export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Surat",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kochi",
  "Chandigarh",
  "Guwahati",
] as const;

// -----------------------------------------------------------------
// Restaurant Cuisine & Category types
// -----------------------------------------------------------------
export const RESTAURANT_CATEGORIES = [
  { slug: "fine-dining", name: "Fine Dining", icon: "UtensilsCrossed" },
  { slug: "cafes-bakeries", name: "Cafes & Bakeries", icon: "Coffee" },
  { slug: "north-indian", name: "North Indian", icon: "Soup" },
  { slug: "south-indian", name: "South Indian", icon: "CookingPot" },
  { slug: "biryani-specialty", name: "Biryani & Kebabs", icon: "Flame" },
  { slug: "street-food", name: "Street Food", icon: "Sandwich" },
  { slug: "pubs-bars", name: "Pubs & Bars", icon: "GlassWater" },
  { slug: "desserts", name: "Desserts & Ice Cream", icon: "Cake" },
] as const;

// -----------------------------------------------------------------
// Price level labels
// -----------------------------------------------------------------
export const PRICE_LEVEL_LABELS: Record<number, string> = {
  1: "Budget (under ₹300 per person)",
  2: "Moderate (₹300–₹700 per person)",
  3: "Fine Dining (₹700–₹1500 per person)",
  4: "Luxury (₹1500+ per person)",
};

// -----------------------------------------------------------------
// Sort options
// -----------------------------------------------------------------
export const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviewCount", label: "Most Reviewed" },
  { value: "newest", label: "Newest Added" },
  { value: "distance", label: "Nearest to Me" },
] as const;

// -----------------------------------------------------------------
// Days of the week
// -----------------------------------------------------------------
export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

// -----------------------------------------------------------------
// Auth
// -----------------------------------------------------------------
export const AUTH_COOKIE_NAME = "authjs.session-token";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// -----------------------------------------------------------------
// Cloudinary
// -----------------------------------------------------------------
export const CLOUDINARY_PLACES_FOLDER = "yelp-india/restaurants";
export const CLOUDINARY_AVATARS_FOLDER = "yelp-india/avatars";
export const CLOUDINARY_REVIEWS_FOLDER = "yelp-india/reviews";
