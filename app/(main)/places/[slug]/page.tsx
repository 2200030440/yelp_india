// app/(main)/places/[slug]/page.tsx
// Server Component — queries Prisma directly server-side for ultra-fast Vercel rendering & SEO.
// Client sub-components handle interactivity (reviews, save, photo upload).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Camera,
  Wifi,
  Car,
  Utensils,
  Sun,
  Users,
  Star,
} from "lucide-react";
import PhotoGallery from "@/components/common/PhotoGallery";
import { Badge } from "@/components/ui/badge";
import { cn, formatRating, formatPriceLevel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { dynamicPlaces } from "@/lib/restaurant-store";
import ReviewSection from "./ReviewSection";
import PlaceSaveButton from "./PlaceSaveButton";
import MapWrapper from "./MapWrapper";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPlaceBySlug(slug: string) {
  try {
    const place = await prisma.place.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        photos: { where: { deletedAt: null }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        openingHours: { orderBy: { dayOfWeek: "asc" } },
        amenities: { include: { amenity: true } },
        reviews: {
          where: { deletedAt: null, isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { id: true, name: true, image: true } },
            photos: { where: { deletedAt: null }, take: 3 },
          },
        },
        _count: {
          select: {
            reviews: { where: { deletedAt: null, isApproved: true } },
            favorites: true,
            photos: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (place) return place;
  } catch (err) {
    console.warn("DB query error in getPlaceBySlug:", err);
  }

  // Fallback store
  const storePlace = dynamicPlaces.getBySlug(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (storePlace) return storePlace as any;

  return null;
}

// ── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Place Not Found" };

  return {
    title: `${place.name} — ${place.city} | YelpIndia`,
    description: place.description ?? `${place.name} in ${place.city}. Rated ${place.averageRating}/5.`,
    openGraph: {
      title: place.name,
      images: place.photos[0] ? [{ url: place.photos[0].url }] : [],
    },
  };
}

// ── Day ordering helper ───────────────────────────────────────────────────

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const AMENITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  WiFi: Wifi,
  Parking: Car,
  "Valet Parking": Car,
  "Air Conditioned": Sun,
  "Full Bar": Utensils,
  Default: CheckCircle2,
};

// ── Page Component ───────────────────────────────────────────────────────

export default async function PlaceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const sortedHours = [...(place.openingHours ?? [])].sort(
    (a: { dayOfWeek: string }, b: { dayOfWeek: string }) =>
      DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );

  const galleryPhotos = place.photos?.length
    ? place.photos.map((p: { url: string; caption?: string | null }) => ({
        url: p.url,
        caption: p.caption ?? undefined,
      }))
    : [
        { url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80" },
        { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" },
        { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" },
      ];

  return (
    <div className="bg-zinc-50 min-h-screen pb-16">
      {/* ── Hero / Gallery ──────────────────────────────────────────── */}
      <section className="bg-zinc-900 text-white pt-8 pb-12">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/places" className="hover:text-white transition-colors">
              Restaurants
            </Link>
            <span>/</span>
            <span className="text-zinc-200">{place.name}</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-white md:text-5xl">{place.name}</h1>
                {place.isVerified && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                )}
                {place.isFeatured && (
                  <Badge className="bg-amber-500 text-white gap-1">
                    <Star className="h-3.5 w-3.5 fill-white" /> Featured
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                {place.category?.name} · {place.city} · {formatPriceLevel(place.priceLevel ?? 2)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.round(place.averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-600 text-zinc-600",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-white">{formatRating(place.averageRating)}</span>
                <span className="text-sm text-zinc-400">
                  ({place.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <PlaceSaveButton placeId={place.id} placeName={place.name} />
            </div>
          </div>

          {/* Gallery */}
          <div className="mt-8">
            <PhotoGallery photos={galleryPhotos} placeName={place.name} />
          </div>
        </div>
      </section>

      {/* ── Main Detail Grid ──────────────────────────────────────── */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: About + Amenities + Reviews */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* About */}
            {place.description && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-red-600" /> About {place.name}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600">{place.description}</p>
              </div>
            )}

            {/* Amenities */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Amenities & Services</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {place.amenities.map((item: { amenity: { id: string; name: string } }) => {
                    const Icon = AMENITY_ICONS[item.amenity.name] ?? AMENITY_ICONS.Default;
                    return (
                      <div key={item.amenity.id} className="flex items-center gap-2.5 text-sm text-zinc-700">
                        <Icon className="h-4 w-4 text-red-600" />
                        <span>{item.amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              placeId={place.id}
              placeName={place.name}
              initialReviews={((place.reviews ?? []).map((r: any) => ({
                ...r,
                user: r.user || { id: "u1", name: "Diner", image: null },
                _count: { likes: r.likeCount ?? 0 },
              }))) as unknown as import("@/lib/api").Review[]}
              reviewCount={place._count?.reviews ?? place.reviewCount}
            />

            {/* Photo Upload */}
            <PhotoUploadSection placeName={place.name} />
          </div>

          {/* Right Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Contact Info */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-zinc-900 text-base border-b border-zinc-100 pb-3">
                Location & Contact
              </h3>
              <div className="flex items-start gap-3 text-sm text-zinc-700">
                <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  {place.address}, {place.city}, {place.state}
                </span>
              </div>
              {place.phone && (
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  <Phone className="h-4 w-4 text-red-600 shrink-0" />
                  <a href={`tel:${place.phone}`} className="hover:underline">
                    {place.phone}
                  </a>
                </div>
              )}
              {place.website && (
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  <Globe className="h-4 w-4 text-red-600 shrink-0" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline truncate"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {place._count && (
                <div className="flex items-center gap-3 text-sm text-zinc-500 border-t border-zinc-100 pt-3">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span>{place._count.favorites.toLocaleString("en-IN")} people saved this</span>
                </div>
              )}
            </div>

            {/* Interactive Map */}
            {place.latitude && place.longitude && (
              <MapWrapper
                latitude={place.latitude}
                longitude={place.longitude}
                placeName={place.name}
                address={`${place.address}, ${place.city}`}
              />
            )}

            {/* Opening Hours */}
            {sortedHours.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-zinc-900 text-base mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-600" /> Opening Hours
                </h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  {sortedHours.map((h: { dayOfWeek: string; isClosed: boolean; openTime: string; closeTime: string }) => (
                    <div key={h.dayOfWeek} className="flex justify-between text-zinc-600">
                      <span className="font-semibold text-zinc-800">
                        {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}
                      </span>
                      {h.isClosed ? (
                        <span className="text-red-500">Closed</span>
                      ) : (
                        <span>
                          {h.openTime} – {h.closeTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 text-sm mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-red-600">{formatRating(place.averageRating)}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Average Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-red-600">{place.reviewCount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Total Reviews</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PhotoUploadSection({ placeName }: { placeName: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
        <Camera className="h-5 w-5 text-red-600" /> Add Your Photos
      </h2>
      <p className="text-sm text-zinc-500">
        Help other diners by sharing your experience photos of {placeName}. Upload them from the button below.
      </p>
      <Link
        href="#upload"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
      >
        <Camera className="h-4 w-4" /> Upload Photos
      </Link>
    </div>
  );
}
