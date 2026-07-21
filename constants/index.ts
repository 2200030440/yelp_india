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
  "New Delhi",
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
  "Goa",
  "Shimla",
  "Puducherry",
  "Dehradun",
  "Mysuru",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  "mumbai": { lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  "delhi": { lat: 28.6139, lng: 77.2090, state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, state: "Delhi" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, state: "Telangana" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  "chennai": { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  "kolkata": { lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  "surat": { lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  "pune": { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  "jaipur": { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  "lucknow": { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  "kochi": { lat: 9.9312, lng: 76.2673, state: "Kerala" },
  "chandigarh": { lat: 30.7333, lng: 76.7794, state: "Chandigarh" },
  "guwahati": { lat: 26.1445, lng: 91.7362, state: "Assam" },
  "goa": { lat: 15.2993, lng: 74.1240, state: "Goa" },
  "shimla": { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh" },
  "indore": { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
  "patna": { lat: 25.5941, lng: 85.1376, state: "Bihar" },
  "varanasi": { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  "srinagar": { lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir" },
  "amritsar": { lat: 31.6340, lng: 74.8723, state: "Punjab" },
  "ranchi": { lat: 23.3441, lng: 85.3096, state: "Jharkhand" },
  "coimbatore": { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
  "mysuru": { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
};

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
