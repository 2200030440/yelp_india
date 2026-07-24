// lib/user-store.ts
// Shared server-side dynamic user store for Yelp India.
// Ensures instant real-time synchronization between Auth, Google Logins,
// User Registrations, and the Admin Users Portal.

import { getStateForCity } from "@/constants";

export interface DynamicUserItem {
  id: string;
  name: string;
  email: string;
  role: "User" | "Moderator" | "Admin" | "USER" | "MODERATOR" | "ADMIN";
  image?: string | null;
  provider?: string; // "google" | "credentials"
  city?: string | null;
  state?: string | null;
  reviewsCount: number;
  joined: string;
  createdAt: string;
}

const INITIAL_USERS: DynamicUserItem[] = [
  {
    id: "admin-id-1",
    name: "Yelp Admin",
    email: "admin@yelpindia.com",
    role: "Admin",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    provider: "credentials",
    city: "Mumbai",
    state: "Maharashtra",
    reviewsCount: 18,
    joined: "Jan 2026",
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "u1",
    name: "Vikram Malhotra",
    email: "vikram@example.com",
    role: "User",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    provider: "credentials",
    city: "Guntur",
    state: "Andhra Pradesh",
    reviewsCount: 14,
    joined: "Jan 2026",
    createdAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "u2",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    role: "Moderator",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    provider: "credentials",
    city: "Bengaluru",
    state: "Karnataka",
    reviewsCount: 42,
    joined: "Dec 2025",
    createdAt: new Date("2025-12-10").toISOString(),
  },
  {
    id: "u3",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    role: "Admin",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
    provider: "credentials",
    city: "Hyderabad",
    state: "Telangana",
    reviewsCount: 8,
    joined: "Nov 2025",
    createdAt: new Date("2025-11-20").toISOString(),
  },
  {
    id: "u4",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "User",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    provider: "google",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    reviewsCount: 5,
    joined: "Feb 2026",
    createdAt: new Date("2026-02-05").toISOString(),
  },
];

// Global persistent object across hot reloads in dev mode
const globalUserStore = globalThis as unknown as {
  dynamicUsersStore?: DynamicUserItem[];
};

if (!globalUserStore.dynamicUsersStore) {
  globalUserStore.dynamicUsersStore = [...INITIAL_USERS];
}

export const dynamicUsers = {
  getAll: (): DynamicUserItem[] => {
    return globalUserStore.dynamicUsersStore ?? INITIAL_USERS;
  },

  addOrUpdate: (input: {
    id?: string;
    name?: string | null;
    email: string;
    role?: string;
    image?: string | null;
    provider?: string;
    city?: string | null;
    state?: string | null;
  }): DynamicUserItem => {
    const list = globalUserStore.dynamicUsersStore ?? INITIAL_USERS;
    const normalizedEmail = input.email.toLowerCase().trim();

    const existingIndex = list.findIndex(
      (u) => u.email.toLowerCase().trim() === normalizedEmail
    );

    const now = new Date();
    const joinedStr = now.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    const displayName =
      input.name && input.name.trim().length > 0
        ? input.name.trim()
        : normalizedEmail.split("@")[0].toUpperCase();

    const cityVal = input.city || "Guntur";
    const stateVal = input.state || getStateForCity(cityVal);

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const updated: DynamicUserItem = {
        ...existing,
        name: displayName,
        image: input.image ?? existing.image,
        provider: input.provider ?? existing.provider ?? "google",
        role: (input.role as any) ?? existing.role,
        city: cityVal,
        state: stateVal,
      };
      list[existingIndex] = updated;
      globalUserStore.dynamicUsersStore = list;
      return updated;
    }

    const newUser: DynamicUserItem = {
      id: input.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: displayName,
      email: normalizedEmail,
      role: (input.role as any) || "User",
      image: input.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
      provider: input.provider || "google",
      city: cityVal,
      state: stateVal,
      reviewsCount: 0,
      joined: joinedStr,
      createdAt: now.toISOString(),
    };

    globalUserStore.dynamicUsersStore = [newUser, ...list];
    return newUser;
  },

  delete: (idOrEmail: string): boolean => {
    const list = globalUserStore.dynamicUsersStore ?? INITIAL_USERS;
    const target = idOrEmail.toLowerCase().trim();
    globalUserStore.dynamicUsersStore = list.filter(
      (u) => u.id !== idOrEmail && u.email.toLowerCase().trim() !== target
    );
    return true;
  },
};
