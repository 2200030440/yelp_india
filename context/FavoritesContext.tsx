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

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceSummary[]>([]);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!session?.user) {
      setSavedPlaces([]);
      setSavedKeys(new Set());
      return;
    }
    setLoading(true);
    try {
      const data = await favoritesApi.list();
      if (data.favorites && Array.isArray(data.favorites)) {
        const keys = new Set<string>();
        const places: SavedPlaceSummary[] = [];

        data.favorites.forEach((f: any) => {
          const p = f.place;
          if (p) {
            if (p.id) keys.add(p.id);
            if (p.slug) keys.add(p.slug);

            places.push({
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

        setSavedKeys(keys);
        setSavedPlaces(places);
      }
    } catch {
      /* ignore */
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

      // Optimistic update
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
        toast(`"${placeName}" added to your saved places!`, "success");
      }

      try {
        if (currentlySaved) {
          await favoritesApi.remove(identifier);
        } else {
          await favoritesApi.add(identifier);
        }
        await refreshFavorites();
      } catch {
        // Revert on failure
        toast("Failed to update saved place. Please try again.", "error");
        await refreshFavorites();
      }
    },
    [session, isSaved, router, toast, refreshFavorites],
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
