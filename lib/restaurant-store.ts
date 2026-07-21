// lib/restaurant-store.ts
// Shared server-side dynamic place store.
// Serves as a unified data bridge between Prisma DB and dynamic fallback state
// ensuring instant multi-location real-time sync across admin and user pages.

import { CITY_COORDINATES } from "@/constants";

export interface PlaceStoreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number | null;
  longitude: number | null;
  priceLevel: number;
  phone?: string;
  email?: string;
  website?: string;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string; icon?: string };
  photos: { url: string; isPrimary?: boolean; caption?: string }[];
  createdAt: string;
  _count: { reviews: number; favorites?: number; photos?: number };
}

const INITIAL_PLACES: PlaceStoreItem[] = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    description: "World-renowned Bukhara brings alive the rustic charm of traditional North-West Frontier dining. Master chefs cook succulent kebabs and overnight slow-cooked Dal Bukhara over traditional charcoal clay tandoors.",
    address: "ITC Maurya, Diplomatic Enclave, Chanakyapuri",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.5985,
    longitude: 77.1870,
    priceLevel: 4,
    phone: "+91 11 2611 2233",
    website: "https://www.itchotels.com/bukhara",
    averageRating: 4.9,
    reviewCount: 2847,
    isVerified: true,
    isFeatured: true,
    category: { name: "North Indian", slug: "north-indian", icon: "Soup" },
    photos: [{ url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80", isPrimary: true }],
    createdAt: new Date().toISOString(),
    _count: { reviews: 2847 },
  },
  {
    id: "2",
    name: "Trishna Coastal Dining",
    slug: "trishna-mumbai",
    description: "Trishna has been the definitive address for coastal seafood in Mumbai since 1981. Their Butter Garlic Crab is legendary worldwide.",
    address: "7, Sai Baba Marg, Kala Ghoda, Fort",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 18.9322,
    longitude: 72.8324,
    priceLevel: 3,
    phone: "+91 22 2270 3213",
    website: "https://trishna.in",
    averageRating: 4.7,
    reviewCount: 1923,
    isVerified: true,
    isFeatured: true,
    category: { name: "Coastal Seafood", slug: "coastal-seafood", icon: "Fish" },
    photos: [{ url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", isPrimary: true }],
    createdAt: new Date().toISOString(),
    _count: { reviews: 1923 },
  },
  {
    id: "3",
    name: "Indian Accent",
    slug: "indian-accent-delhi",
    description: "Indian Accent reinterprets Indian food with global techniques and local ingredients. An extraordinary fine dining experience.",
    address: "The Lodhi, Lodhi Road",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.5919,
    longitude: 77.2219,
    priceLevel: 4,
    phone: "+91 11 2611 6666",
    website: "https://indianaccent.com",
    averageRating: 4.8,
    reviewCount: 3156,
    isVerified: true,
    isFeatured: true,
    category: { name: "Fine Dining", slug: "fine-dining", icon: "UtensilsCrossed" },
    photos: [{ url: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80", isPrimary: true }],
    createdAt: new Date().toISOString(),
    _count: { reviews: 3156 },
  },
  {
    id: "4",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    description: "Paradise is synonymous with Hyderabad biryani since 1953. Their legendary Dum Biryani is the gold standard of Hyderabadi cuisine.",
    address: "M.G. Road, Paradise Circle, Secunderabad",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.4435,
    longitude: 78.4990,
    priceLevel: 2,
    phone: "+91 40 2784 7700",
    website: "https://www.paradisebiryani.com",
    averageRating: 4.6,
    reviewCount: 5432,
    isVerified: true,
    isFeatured: true,
    category: { name: "Biryani & Kebabs", slug: "biryani-specialty", icon: "Flame" },
    photos: [{ url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", isPrimary: true }],
    createdAt: new Date().toISOString(),
    _count: { reviews: 5432 },
  },
  {
    id: "5",
    name: "Karavalli Heritage Kitchen",
    slug: "karavalli-bengaluru",
    description: "Serving authentic coastal specialties from Mangalore, Kerala, and Goa amidst lush heritage architecture.",
    address: "66 Residency Road, Taj Gateway",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    priceLevel: 3,
    phone: "+91 80 6660 4545",
    website: "https://karavallirestaurant.com",
    averageRating: 4.7,
    reviewCount: 1654,
    isVerified: true,
    isFeatured: true,
    category: { name: "South Indian", slug: "south-indian", icon: "CookingPot" },
    photos: [{ url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", isPrimary: true }],
    createdAt: new Date().toISOString(),
    _count: { reviews: 1654 },
  },
];

// Persistent global variable across hot-reloads
const globalStore = globalThis as unknown as {
  dynamicPlacesStore?: PlaceStoreItem[];
};

if (!globalStore.dynamicPlacesStore) {
  globalStore.dynamicPlacesStore = [...INITIAL_PLACES];
}

export const dynamicPlaces = {
  getAll: () => globalStore.dynamicPlacesStore ?? INITIAL_PLACES,

  getBySlug: (slug: string) => {
    const list = globalStore.dynamicPlacesStore ?? INITIAL_PLACES;
    return list.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  add: (input: {
    name: string;
    cuisine?: string;
    categorySlug?: string;
    city: string;
    state?: string;
    address?: string;
    postalCode?: string;
    latitude?: number | null;
    longitude?: number | null;
    priceLevel?: number;
    phone?: string;
    website?: string;
    description?: string;
    photoUrl?: string;
  }): PlaceStoreItem => {
    const list = globalStore.dynamicPlacesStore ?? INITIAL_PLACES;
    
    // Auto lookup state and lat/lng if not provided
    const cityKey = input.city.toLowerCase().trim();
    const cityData = CITY_COORDINATES[cityKey];
    
    const state = input.state || cityData?.state || "India";
    const latitude = input.latitude ?? (cityData?.lat ? cityData.lat + (Math.random() - 0.5) * 0.05 : 20.5937);
    const longitude = input.longitude ?? (cityData?.lng ? cityData.lng + (Math.random() - 0.5) * 0.05 : 78.9629);

    const baseSlug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const citySlug = input.city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let slug = `${baseSlug}-${citySlug}`;
    
    // Ensure unique slug
    let counter = 1;
    while (list.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${citySlug}-${counter}`;
      counter++;
    }

    const categoryName = input.cuisine || "North Indian";
    const catSlug = input.categorySlug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const photoUrl = input.photoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

    const newItem: PlaceStoreItem = {
      id: String(Date.now()),
      name: input.name,
      slug,
      description: input.description || `${input.name} is a premier dining destination located in ${input.city}, ${state}.`,
      address: input.address || `${input.city}, ${state}`,
      city: input.city,
      state,
      country: "India",
      postalCode: input.postalCode || "400001",
      latitude,
      longitude,
      priceLevel: Number(input.priceLevel || 2),
      phone: input.phone || "+91 98765 43210",
      website: input.website || "",
      averageRating: 5.0,
      reviewCount: 1,
      isVerified: true,
      isFeatured: true,
      category: { name: categoryName, slug: catSlug, icon: "UtensilsCrossed" },
      photos: [{ url: photoUrl, isPrimary: true }],
      createdAt: new Date().toISOString(),
      _count: { reviews: 1, favorites: 0, photos: 1 },
    };

    globalStore.dynamicPlacesStore = [newItem, ...list];
    return newItem;
  },

  delete: (idOrSlug: string) => {
    const list = globalStore.dynamicPlacesStore ?? INITIAL_PLACES;
    globalStore.dynamicPlacesStore = list.filter(
      (p) => p.id !== idOrSlug && p.slug !== idOrSlug
    );
    return true;
  },
};
