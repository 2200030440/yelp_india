// app/api/auth/[...nextauth]/route.ts
// Auth.js Route Handlers for Next.js App Router

import { handlers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
