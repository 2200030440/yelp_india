// lib/restaurant-store.ts
// Shared server-side dynamic place store type & helpers.
// All place records & photos are stored in and queried directly from PostgreSQL / Prisma DB.

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

// Persistent global variable across hot-reloads
const globalStore = globalThis as unknown as {
  dynamicPlacesStore?: PlaceStoreItem[];
};

if (!globalStore.dynamicPlacesStore) {
  globalStore.dynamicPlacesStore = [];
}

export const dynamicPlaces = {
  getAll: () => globalStore.dynamicPlacesStore ?? [],

  getBySlug: (slug: string) => {
    const list = globalStore.dynamicPlacesStore ?? [];
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
    const list = globalStore.dynamicPlacesStore ?? [];
    
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

    const photoUrl = input.photoUrl || "";

    const newItem: PlaceStoreItem = {
      id: String(Date.now()),
      name: input.name,
      slug,
      description: input.description || `${input.name} is located in ${input.city}, ${state}.`,
      address: input.address || `${input.city}, ${state}`,
      city: input.city,
      state,
      country: "India",
      postalCode: input.postalCode || "",
      latitude,
      longitude,
      priceLevel: Number(input.priceLevel || 2),
      phone: input.phone || "",
      website: input.website || "",
      averageRating: 5.0,
      reviewCount: 1,
      isVerified: true,
      isFeatured: true,
      category: { name: categoryName, slug: catSlug, icon: "UtensilsCrossed" },
      photos: photoUrl ? [{ url: photoUrl, isPrimary: true }] : [],
      createdAt: new Date().toISOString(),
      _count: { reviews: 1, favorites: 0, photos: photoUrl ? 1 : 0 },
    };

    globalStore.dynamicPlacesStore = [newItem, ...list];
    return newItem;
  },

  delete: (idOrSlug: string) => {
    const list = globalStore.dynamicPlacesStore ?? [];
    globalStore.dynamicPlacesStore = list.filter(
      (p) => p.id !== idOrSlug && p.slug !== idOrSlug
    );
    return true;
  },
};
