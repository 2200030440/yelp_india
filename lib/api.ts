// lib/api.ts
// Shared typed API fetcher utilities for client-side data fetching.
// Server components should use prisma directly for best performance.

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    : "";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Typed helpers ─────────────────────────────────────────────────────────

export const placesApi = {
  list: (params: Record<string, string | number | boolean>) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== "" && v !== 0 && v !== false)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiFetch<{ places: PlaceCard[]; pagination: Pagination }>(
      `/api/places${qs ? `?${qs}` : ""}`,
    );
  },
  detail: (slug: string) =>
    apiFetch<{ place: PlaceDetail }>(`/api/places/${slug}`),
};

export const reviewsApi = {
  list: (placeId: string, page = 1) =>
    apiFetch<{ reviews: Review[]; pagination: Pagination }>(
      `/api/reviews?placeId=${placeId}&page=${page}`,
    ),
  create: (data: { placeId: string; rating: number; content: string }) =>
    apiFetch<{ review: Review }>("/api/reviews", {
      method: "POST",
      body:   JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/reviews/${id}`, { method: "DELETE" }),
};

export const favoritesApi = {
  list:   () => apiFetch<{ favorites: Favorite[] }>("/api/favorites"),
  add:    (placeId: string) =>
    apiFetch<{ favorite: Favorite }>("/api/favorites", {
      method: "POST",
      body:   JSON.stringify({ placeId }),
    }),
  remove: (placeId: string) =>
    apiFetch<{ success: boolean }>(`/api/favorites?placeId=${placeId}`, {
      method: "DELETE",
    }),
};

export const usersApi = {
  me:     () => apiFetch<{ user: UserProfile }>("/api/users/me"),
  update: (data: Partial<{ name: string; bio: string; city: string; image: string }>) =>
    apiFetch<{ user: UserProfile }>("/api/users/me", {
      method: "PATCH",
      body:   JSON.stringify(data),
    }),
};

// ── Shared Types ──────────────────────────────────────────────────────────

export interface Pagination {
  page:  number;
  limit: number;
  total: number;
  pages: number;
}

export interface PlaceCard {
  id:            string;
  name:          string;
  slug:          string;
  city:          string;
  state:         string;
  address:       string;
  priceLevel:    number;
  averageRating: number;
  reviewCount:   number;
  isVerified:    boolean;
  isFeatured:    boolean;
  latitude:      number | null;
  longitude:     number | null;
  category:      { name: string; slug: string };
  photos:        { url: string }[];
  _count:        { reviews: number };
}

export interface PlaceDetail extends PlaceCard {
  description:  string | null;
  phone:        string | null;
  email:        string | null;
  website:      string | null;
  photos:       Photo[];
  openingHours: OpeningHour[];
  amenities:    { amenity: Amenity }[];
  reviews:      Review[];
  _count:       { reviews: number; favorites: number; photos: number };
}

export interface Photo {
  id:        string;
  url:       string;
  publicId:  string | null;
  caption:   string | null;
  isPrimary: boolean;
}

export interface OpeningHour {
  id:        string;
  dayOfWeek: string;
  openTime:  string;
  closeTime: string;
  isClosed:  boolean;
}

export interface Amenity {
  id:   string;
  name: string;
  icon: string | null;
}

export interface Review {
  id:        string;
  rating:    number;
  content:   string;
  createdAt: string;
  likeCount: number;
  user:      { id: string; name: string | null; image: string | null };
  photos:    Photo[];
  _count:    { likes: number };
}

export interface Favorite {
  id:        string;
  createdAt: string;
  place:     PlaceCard;
}

export interface UserProfile {
  id:        string;
  name:      string | null;
  email:     string;
  image:     string | null;
  bio:       string | null;
  city:      string | null;
  role:      string;
  createdAt: string;
  _count:    { reviews: number; favorites: number; photos: number };
  reviews:   (Review & { place: Pick<PlaceCard, "id" | "name" | "slug" | "city"> })[];
  favorites: Favorite[];
}
