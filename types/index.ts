// types/index.ts
// Global TypeScript types and interfaces.

export type {
  User,
  Account,
  Session,
  Category,
  Place,
  OpeningHour,
  Amenity,
  Review,
  Photo,
  Favorite,
  ReviewLike,
  Report,
  AuditLog,
  Role,
  ReportStatus,
  DayOfWeek,
} from "@prisma/client";

// -----------------------------------------------------------------
// API Response wrapper — every API route returns this shape
// -----------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

// -----------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// -----------------------------------------------------------------
// Search & Filter
// -----------------------------------------------------------------
export interface PlaceFilters {
  categorySlug?: string;
  city?: string;
  minRating?: number;
  priceLevel?: number[];
  search?: string;
  sortBy?: "rating" | "reviewCount" | "newest" | "distance";
  page?: number;
  pageSize?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  isVegOnly?: boolean;
  maxDistanceKm?: number;
}

// -----------------------------------------------------------------
// Price level
// -----------------------------------------------------------------
export type PriceLevel = 1 | 2 | 3 | 4;

// -----------------------------------------------------------------
// Map coordinates
// -----------------------------------------------------------------
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// -----------------------------------------------------------------
// Place with commonly joined relations (used in listing cards)
// -----------------------------------------------------------------
export interface PlaceWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  priceLevel: number | null;
  phone: string | null;
  website: string | null;
  averageRating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  photos: {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }[];
  createdAt: Date;
}
