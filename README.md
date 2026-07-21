# Yelp India 🍽️

> A production-grade, Yelp-like platform for discovering restaurants, hotels, and local businesses across India.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Lucide Icons |
| Animations | Framer Motion |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Auth.js (NextAuth v5) |
| State | TanStack Query |
| Validation | Zod + React Hook Form |
| Images | Cloudinary |
| Maps | Leaflet + OpenStreetMap |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account
- A [Cloudinary](https://cloudinary.com) account
- A [Resend](https://resend.com) account
- Google + GitHub OAuth credentials

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/yelp-india.git
cd yelp-india

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to database (dev only)
npm run db:push

# 6. Seed the database
npm run db:seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format all files with Prettier |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to dev database |
| `npm run db:migrate` | Run migrations in development |
| `npm run db:migrate:prod` | Apply migrations in production |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset and reseed database |

---

## Project Structure

```
yelp-india/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register
│   ├── (main)/             # Homepage, places, search, profile, saved
│   ├── (admin)/            # Admin panel
│   └── api/                # API Route Handlers
├── actions/                # Server Actions (auth, places, reviews, favorites)
├── components/             # UI and layout components
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Navbar, Footer, Sidebar
│   └── common/             # MapView, PhotoGallery, RestaurantCard, etc.
├── lib/                    # Core utilities, Auth, Prisma, Cloudinary, Resend
├── types/                  # Global TypeScript definitions
├── constants/              # App constants and static data
├── config/                 # Site configuration
├── providers/              # React context providers
├── prisma/                 # Database schema + migrations + seeds
└── middleware.ts           # NextAuth Edge authentication middleware
```

---

## Architecture Decisions

See [implementation_plan.md](./.agents/implementation_plan.md) for full ADR documentation.

Key decisions:
- **Generic `Place` entity** — never hardcoded as Restaurant
- **Feature-based structure** — scales to large teams
- **UUID primary keys** — prevents enumeration attacks
- **Soft deletes** — all records have `deletedAt` for audit trail

---

## Environment Variables

See [`.env.example`](./.env.example) for all required variables with explanations.

---

## Development Phases

| Phase | Status |
|-------|--------|
| 1. Project Setup | ✅ Complete |
| 2. Database Design | 🔜 Next |
| 3. Authentication | ⏳ Pending |
| 4. Design System | ⏳ Pending |
| 5. Core Layout | ⏳ Pending |
| 6. Place Listing | ⏳ Pending |
| 7. Place Detail | ⏳ Pending |
| 8. Reviews & Ratings | ⏳ Pending |
| 9. Search & Filters | ⏳ Pending |
| 10. Favorites | ⏳ Pending |
| 11. User Profile | ⏳ Pending |
| 12. Admin Panel | ⏳ Pending |
| 13. Image Upload | ⏳ Pending |
| 14. Maps | ⏳ Pending |
| 15. Email | ⏳ Pending |
| 16. Performance & SEO | ⏳ Pending |
| 17. Testing | ⏳ Pending |
| 18. Deployment | ⏳ Pending |

---

## License

Private. All rights reserved.
