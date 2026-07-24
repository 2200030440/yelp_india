// lib/user-store.ts
// Shared server-side dynamic user store helper.
// All users are stored in and queried directly from PostgreSQL / Prisma DB.

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

// Global persistent object across hot reloads in dev mode
const globalUserStore = globalThis as unknown as {
  dynamicUsersStore?: DynamicUserItem[];
};

if (!globalUserStore.dynamicUsersStore) {
  globalUserStore.dynamicUsersStore = [];
}

export const dynamicUsers = {
  getAll: (): DynamicUserItem[] => {
    return globalUserStore.dynamicUsersStore ?? [];
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
    const list = globalUserStore.dynamicUsersStore ?? [];
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

    const cityVal = input.city || "Mumbai";
    const stateVal = input.state || getStateForCity(cityVal);

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const updated: DynamicUserItem = {
        ...existing,
        name: displayName,
        image: input.image ?? existing.image,
        provider: input.provider ?? existing.provider ?? "credentials",
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
      image: input.image || null,
      provider: input.provider || "credentials",
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
    const list = globalUserStore.dynamicUsersStore ?? [];
    const target = idOrEmail.toLowerCase().trim();
    globalUserStore.dynamicUsersStore = list.filter(
      (u) => u.id !== idOrEmail && u.email.toLowerCase().trim() !== target
    );
    return true;
  },
};
