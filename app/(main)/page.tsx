"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  UtensilsCrossed,
  Coffee,
  Soup,
  CookingPot,
  Flame,
  Sandwich,
  GlassWater,
  Cake,
  Shield,
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { cn, formatRating, formatPriceLevel } from "@/lib/utils";
import CitySelector from "@/components/common/CitySelector";

// ─── Restaurant Data ─────────────────────────────────────────────────────────

const FEATURED_RESTAURANTS = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    cuisine: "North Indian / Tandoori",
    city: "New Delhi",
    rating: 4.9,
    reviewCount: 2847,
    priceLevel: 4,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    isOpen: true,
    badge: "Award Winner",
  },
  {
    id: "2",
    name: "Trishna Coastal Dining",
    slug: "trishna-mumbai",
    cuisine: "Coastal Seafood",
    city: "Mumbai",
    rating: 4.7,
    reviewCount: 1923,
    priceLevel: 3,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    isOpen: true,
    badge: "Most Loved",
  },
  {
    id: "3",
    name: "Indian Accent",
    slug: "indian-accent-delhi",
    cuisine: "Modern Indian Fine Dining",
    city: "New Delhi",
    rating: 4.8,
    reviewCount: 3156,
    priceLevel: 4,
    image:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80",
    isOpen: false,
    badge: "Top Pick",
  },
  {
    id: "4",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    cuisine: "Hyderabadi Biryani & Kebabs",
    city: "Hyderabad",
    rating: 4.6,
    reviewCount: 5432,
    priceLevel: 2,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&q=80",
    isOpen: true,
    badge: "Iconic",
  },
  {
    id: "5",
    name: "Karavalli Heritage Kitchen",
    slug: "karavalli-bengaluru",
    cuisine: "South Indian Coastal",
    city: "Bengaluru",
    rating: 4.7,
    reviewCount: 1654,
    priceLevel: 3,
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    isOpen: true,
    badge: null,
  },
  {
    id: "6",
    name: "Saravana Bhavan",
    slug: "saravana-bhavan-chennai",
    cuisine: "Authentic South Indian Tiffin",
    city: "Chennai",
    rating: 4.5,
    reviewCount: 8921,
    priceLevel: 1,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    isOpen: true,
    badge: "Local Favorite",
  },
];

const RESTAURANT_CATEGORIES = [
  {
    name: "Fine Dining",
    icon: UtensilsCrossed,
    count: "1,200+ Spots",
    color: "bg-red-50 text-red-600 group-hover:bg-red-100",
    href: "/places?category=fine-dining",
  },
  {
    name: "Cafes & Bakeries",
    icon: Coffee,
    count: "2,400+ Spots",
    color: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    href: "/places?category=cafes-bakeries",
  },
  {
    name: "North Indian",
    icon: Soup,
    count: "4,500+ Spots",
    color: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
    href: "/places?category=north-indian",
  },
  {
    name: "South Indian",
    icon: CookingPot,
    count: "3,800+ Spots",
    color: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100",
    href: "/places?category=south-indian",
  },
  {
    name: "Biryani & Kebabs",
    icon: Flame,
    count: "3,100+ Spots",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    href: "/places?category=biryani-specialty",
  },
  {
    name: "Street Food",
    icon: Sandwich,
    count: "5,200+ Spots",
    color: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    href: "/places?category=street-food",
  },
  {
    name: "Pubs & Bars",
    icon: GlassWater,
    count: "1,600+ Spots",
    color: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    href: "/places?category=pubs-bars",
  },
  {
    name: "Desserts & Shakes",
    icon: Cake,
    count: "2,100+ Spots",
    color: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
    href: "/places?category=desserts",
  },
];

const STATS = [
  { value: "25,000+", label: "Restaurants Listed", icon: MapPin },
  { value: "150,000+", label: "Foodie Reviews", icon: Star },
  { value: "500+", label: "Cities in India", icon: TrendingUp },
  { value: "2M+", label: "Monthly Food Lovers", icon: Users },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Find Top Restaurants",
    description:
      "Search by cuisine, dish, or neighborhood across 500+ Indian cities.",
    icon: Search,
    color: "text-red-600 bg-red-50",
  },
  {
    step: "02",
    title: "Read Real Reviews",
    description:
      "Explore honest diner reviews, food photos, menus, and ratings from verified foodies.",
    icon: Shield,
    color: "text-blue-600 bg-blue-50",
  },
  {
    step: "03",
    title: "Share Your Food Journey",
    description:
      "Post reviews, rate dishes, and upload mouth-watering photos after your meal.",
    icon: Users,
    color: "text-green-600 bg-green-50",
  },
];

const TOP_CITIES = [
  {
    name: "Mumbai",
    tagline: "Vada Pav & Coastal Seafood",
    count: "4,200+ Spots",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
  },
  {
    name: "New Delhi",
    tagline: "Butter Chicken & Street Food",
    count: "5,100+ Spots",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  },
  {
    name: "Bengaluru",
    tagline: "Craft Beer & South Indian Dosa",
    count: "3,800+ Spots",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80",
  },
  {
    name: "Hyderabad",
    tagline: "World Famous Biryani & Irani Chai",
    count: "3,400+ Spots",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80",
  },
  {
    name: "Chennai",
    tagline: "Filter Coffee & Authentic Tiffin",
    count: "2,900+ Spots",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80",
  },
  {
    name: "Kolkata",
    tagline: "Kathi Rolls & Bengali Sweets",
    count: "3,100+ Spots",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=600&q=80",
  },
];

// ─── Star Rating Component ────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200",
          )}
        />
      ))}
    </div>
  );
}

// ─── Hero Search Bar ──────────────────────────────────────────────────────────

function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
      >
        {/* Query input */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-all focus-within:border-zinc-400 focus-within:shadow-xs">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Biryani, Butter Chicken, Cafes, Rooftop…"
            className="w-full text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
          />
        </div>

        {/* Custom Premium City Selector */}
        <CitySelector
          value={city}
          onChange={setCity}
          placeholder="Location / City..."
        />

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Search className="h-4 w-4" />
          <span>Find Food</span>
        </button>
      </form>

      {/* Quick tags */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-white/60">Popular Searches:</span>
        {["Hyderabadi Biryani", "Butter Chicken", "Rooftop Cafes", "South Indian Thali", "Cocktail Bars"].map(
          (tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {tag}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Restaurant Card ─────────────────────────────────────────────────────────

function RestaurantCard({ place }: { place: (typeof FEATURED_RESTAURANTS)[0] }) {
  return (
    <Link
      href={`/places/${place.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-zinc-100">
        <Image
          src={place.image}
          alt={place.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge */}
        {place.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-sm">
            {place.badge}
          </span>
        )}

        {/* Open/Closed */}
        <span
          className={cn(
            "absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
            place.isOpen
              ? "bg-emerald-600/90 text-white"
              : "bg-zinc-800/80 text-zinc-300",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              place.isOpen ? "bg-white" : "bg-zinc-400",
            )}
          />
          {place.isOpen ? "Open now" : "Closed"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-red-600 leading-snug">
            {place.name}
          </h3>
          <span className="shrink-0 text-sm font-medium text-zinc-500">
            {formatPriceLevel(place.priceLevel)}
          </span>
        </div>

        {/* Cuisine + City */}
        <p className="text-sm text-zinc-500">
          {place.cuisine} · {place.city}
        </p>

        {/* Rating */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <StarRating rating={place.rating} />
          <span className="text-sm font-semibold text-zinc-800">
            {formatRating(place.rating)}
          </span>
          <span className="text-sm text-zinc-400">
            ({place.reviewCount.toLocaleString("en-IN")} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSection() {
  const [places, setPlaces] = useState<typeof FEATURED_RESTAURANTS>(FEATURED_RESTAURANTS);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/places");
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.places || []).map((p: { id?: string; name: string; slug: string; category?: { name?: string }; cuisine?: string; city: string; averageRating?: number; rating?: number; reviewCount?: number; priceLevel?: number; photos?: Array<{ url?: string }>; isFeatured?: boolean }) => ({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            cuisine: p.category?.name || p.cuisine || "North Indian",
            city: p.city,
            rating: p.averageRating ?? p.rating ?? 5.0,
            reviewCount: p.reviewCount ?? 1,
            priceLevel: p.priceLevel ?? 2,
            image: p.photos?.[0]?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
            isOpen: true,
            badge: p.isFeatured ? "Featured" : null,
          }));
          if (mapped.length > 0) setPlaces(mapped.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch featured places", err);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <RestaurantCard key={place.id} place={place} />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-orange-900 px-4 py-20 md:py-32">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />

        <div className="container relative text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            India&apos;s Dedicated Restaurant & Food Review Portal
          </div>

          {/* Headline */}
          <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Discover & Review India&apos;s
            <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Top Restaurants
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/70">
            Honest reviews, authentic food photos, and curated ratings from real Indian foodies.
          </p>

          {/* Search Bar */}
          <HeroSearch />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-200 bg-white py-8">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <stat.icon className="mb-1 h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-zinc-900">
                {stat.value}
              </span>
              <span className="text-sm text-zinc-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cuisine Categories ───────────────────────────────────────────── */}
      <section className="bg-zinc-50/50 py-16">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">
                Browse Cuisines & Dining
              </p>
              <h2 className="text-3xl font-bold text-zinc-900">
                What are you craving today?
              </h2>
            </div>
            <Link
              href="/places"
              className="hidden items-center gap-1 text-sm font-medium text-zinc-600 hover:text-red-600 md:flex"
            >
              View all categories <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {RESTAURANT_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    cat.color,
                  )}
                >
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 leading-snug">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Food Cities ──────────────────────────────────────────────── */}
      <section className="border-b border-zinc-100 bg-white py-16">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">
                Explore Destinations
              </p>
              <h2 className="text-3xl font-bold text-zinc-900">
                Top Food Cities in India
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden items-center gap-1 text-sm font-medium text-zinc-600 hover:text-red-600 md:flex"
            >
              All 500+ Cities <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_CITIES.map((c) => (
              <Link
                key={c.name}
                href={`/search?city=${encodeURIComponent(c.name)}`}
                className="group relative flex h-48 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-75"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative mt-auto flex w-full items-end justify-between p-5 text-white">
                  <div>
                    <h3 className="text-xl font-bold">{c.name}</h3>
                    <p className="text-xs text-zinc-300">{c.tagline}</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    {c.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Restaurants ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">
                Top Rated Dining
              </p>
              <h2 className="text-3xl font-bold text-zinc-900">
                Featured Restaurants Across India
              </h2>
            </div>
            <Link
              href="/places?sort=rating"
              className="hidden items-center gap-1 text-sm font-medium text-zinc-600 hover:text-red-600 md:flex"
            >
              Explore all restaurants <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <FeaturedSection />

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/places"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              See all restaurants <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-red-600">
              For Food Lovers & Diners
            </p>
            <h2 className="text-3xl font-bold text-zinc-900">How Yelp India Works</h2>
            <p className="mx-auto mt-3 max-w-md text-zinc-500">
              Find great food, read honest reviews, and rate your dining experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute right-0 top-10 hidden w-1/2 border-t-2 border-dashed border-zinc-300 md:block" />
                )}
                <div
                  className={cn(
                    "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl",
                    step.color,
                  )}
                >
                  <step.icon className="h-8 w-8" />
                </div>
                <span className="mb-1 text-xs font-bold tracking-widest text-zinc-400">
                  STEP {step.step}
                </span>
                <h3 className="mb-2 text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 py-20">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            100% Free for Diners & Food Enthusiasts
          </div>
          <h2 className="mx-auto mb-4 max-w-2xl text-4xl font-extrabold text-white">
            Join 2 Million+ Foodies in India
          </h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
            Create your account to write restaurant reviews, upload food photos, and save your favourite dining spots.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              Sign Up Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/places"
              className="flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore Restaurants
            </Link>
          </div>
          <p className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Verified Food Reviews
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Quick 30s Setup
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
