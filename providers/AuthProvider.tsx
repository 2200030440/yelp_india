"use client";

// providers/AuthProvider.tsx
// Auth.js SessionProvider wrapper for Client Components

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
