"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { favoritesApi } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export interface SavedPlaceSummary {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  image: string;
  isOpen: boolean;
}

interface FavoritesContextType {
  savedPlaces: SavedPlaceSummary[];
  savedKeys: Set<string>;
  loading: boolean;
  isSaved: (identifier: string) => boolean;
  toggleSave: (place: {
    id: string;
    slug: string;
    name?: string;
    cuisine?: string;
    city?: string;
    rating?: number;
    reviewCount?: number;
    priceLevel?: number;
    image?: string;
  }) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "yelp_india_saved_places";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceSummary[]>([]);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount / initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: SavedPlaceSummary[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPlaces(parsed);
          const keys = new Set<string>();
          parsed.forEach((p) => {
            if (p.id) keys.add(p.id);
            if (p.slug) keys.add(p.slug);
          });
          setSavedKeys(keys);
        }
      }
    } catch {
      /* ignore localStorage parse errors */
    }
  }, []);

  // Sync savedPlaces to localStorage whenever it changes
  useEffect(() => {
    if (savedPlaces.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedPlaces));
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [savedPlaces]);

  const refreshFavorites = useCallback(async () => {
    if (!session?.user) {
      return;
    }
    setLoading(true);
    try {
      const data = await favoritesApi.list();
      if (data.favorites && Array.isArray(data.favorites)) {
        const keys = new Set<string>();
        const placesFromApi: SavedPlaceSummary[] = [];

        data.favorites.forEach((f: any) => {
          const p = f.place;
          if (p) {
            if (p.id) keys.add(p.id);
            if (p.slug) keys.add(p.slug);

            placesFromApi.push({
              id: p.id,
              name: p.name ?? "Saved Place",
              slug: p.slug ?? "",
              cuisine: p.category?.name ?? "Restaurant",
              city: p.city ?? "India",
              rating: p.averageRating ?? 4.8,
              reviewCount: p.reviewCount ?? 0,
              priceLevel: p.priceLevel ?? 2,
              image:
                p.photos?.[0]?.url ??
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
              isOpen: true,
            });
          }
        });

        // Combine API places with any local items
        setSavedPlaces((prev) => {
          const map = new Map<string, SavedPlaceSummary>();
          placesFromApi.forEach((item) => map.set(item.id || item.slug, item));
          prev.forEach((item) => {
            const k = item.id || item.slug;
            if (!map.has(k)) map.set(k, item);
          });
          const merged = Array.from(map.values());
          merged.forEach((p) => {
            if (p.id) keys.add(p.id);
            if (p.slug) keys.add(p.slug);
          });
          setSavedKeys(keys);
          return merged;
        });
      }
    } catch {
      /* ignore API network errors and retain local state */
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isSaved = useCallback(
    (identifier: string) => {
      if (!identifier) return false;
      return savedKeys.has(identifier);
    },
    [savedKeys],
  );

  const toggleSave = useCallback(
    async (place: {
      id: string;
      slug: string;
      name?: string;
      cuisine?: string;
      city?: string;
      rating?: number;
      reviewCount?: number;
      priceLevel?: number;
      image?: string;
    }) => {
      if (!session?.user) {
        toast("Please log in to save restaurants to your wishlist.", "info");
        router.push("/login");
        return;
      }

      const identifier = place.id || place.slug;
      const currentlySaved = isSaved(identifier) || isSaved(place.slug) || isSaved(place.id);
      const placeName = place.name || "Restaurant";

      // Optimistic update for keys
      setSavedKeys((prev) => {
        const next = new Set(prev);
        if (currentlySaved) {
          if (place.id) next.delete(place.id);
          if (place.slug) next.delete(place.slug);
        } else {
          if (place.id) next.add(place.id);
          if (place.slug) next.add(place.slug);
        }
        return next;
      });

      if (currentlySaved) {
        setSavedPlaces((prev) => prev.filter((p) => p.id !== place.id && p.slug !== place.slug));
        toast(`Removed "${placeName}" from your saved places`, "info");
      } else {
        const newPlace: SavedPlaceSummary = {
          id: place.id,
          name: place.name || "Saved Place",
          slug: place.slug || place.id,
          cuisine: place.cuisine || "Restaurant",
          city: place.city || "India",
          rating: place.rating ?? 4.8,
          reviewCount: place.reviewCount ?? 0,
          priceLevel: place.priceLevel ?? 2,
          image: place.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
          isOpen: true,
        };
        setSavedPlaces((prev) => [newPlace, ...prev.filter((p) => p.id !== place.id && p.slug !== place.slug)]);
        toast(`"${placeName}" added to your saved places!`, "success");
      }

      try {
        if (currentlySaved) {
          await favoritesApi.remove(identifier);
        } else {
          await favoritesApi.add(identifier);
        }
      } catch {
        /* Keep local optimistic bookmark intact */
      }
    },
    [session, isSaved, router, toast],
  );

  return (
    <FavoritesContext.Provider
      value={{
        savedPlaces,
        savedKeys,
        loading,
        isSaved,
        toggleSave,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
