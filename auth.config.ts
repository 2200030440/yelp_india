// auth.config.ts
// Edge-compatible NextAuth v5 configuration (used by Next.js 16 proxy / middleware)

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
  secret: process.env.AUTH_SECRET ?? "yelp-india-dev-secret-key-32145-secure",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = String(token.id);
        else if (token.sub) session.user.id = token.sub;
        if (token.role) session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
