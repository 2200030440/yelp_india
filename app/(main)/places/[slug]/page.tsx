"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  CheckCircle2,
  Heart,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  Wifi,
  Car,
  Utensils,
  Sun,
  ShieldCheck,
} from "lucide-react";
import StarRating from "@/components/common/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatRating, formatPriceLevel } from "@/lib/utils";

// Mock Restaurant Detail Data
const RESTAURANT_DETAIL = {
  id: "1",
  name: "Bukhara - ITC Maurya",
  slug: "bukhara-delhi",
  category: "North Indian / Tandoori Fine Dining",
  city: "New Delhi",
  address: "ITC Maurya, Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110021",
  phone: "+91 11 2611 2233",
  website: "https://www.itchotels.com/bukhara",
  rating: 4.9,
  reviewCount: 2847,
  priceLevel: 4,
  isOpen: true,
  isVerified: true,
  description:
    "World-renowned Bukhara brings alive the rustic charm of traditional North-West Frontier dining. Master chefs cook succulent kebabs and overnight slow-cooked Dal Bukhara over traditional charcoal clay tandoors.",
  photos: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  ],
  hours: [
    { day: "Monday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Tuesday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Wednesday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Thursday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Friday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Saturday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
    { day: "Sunday", time: "12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM" },
  ],
  amenities: [
    { name: "Valet Parking", icon: Car },
    { name: "Air Conditioned", icon: Sun },
    { name: "Free High-Speed Wi-Fi", icon: Wifi },
    { name: "Full Bar Available", icon: Utensils },
    { name: "Table Reservations", icon: CheckCircle2 },
  ],
};

const INITIAL_REVIEWS = [
  {
    id: "r1",
    author: "Vikram Malhotra",
    avatar: "V",
    rating: 5,
    date: "2 days ago",
    content:
      "The Dal Bukhara cooked for 18 hours overnight is legendary. Paired with Naan Bukhari, it is pure heaven. Truly deserving of its global fame!",
    likes: 42,
  },
  {
    id: "r2",
    author: "Ananya Sharma",
    avatar: "A",
    rating: 5,
    date: "1 week ago",
    content:
      "Exceptional hospitality from the moment we arrived. The Murgh Malai Kebab melts in your mouth. Worth every rupee for special family celebrations.",
    likes: 18,
  },
  {
    id: "r3",
    author: "Rahul Mehta",
    avatar: "R",
    rating: 4,
    date: "2 weeks ago",
    content:
      "Authentic tandoori food cooked in clay ovens. Table reservations are highly recommended as weekend dinner slots book out fast.",
    likes: 9,
  },
];

export default function RestaurantDetailPage() {
  const { toast } = useToast();
  const rest = RESTAURANT_DETAIL;

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isSaved, setIsSaved] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast(
      isSaved ? "Removed from saved places" : "Saved to your favourite places!",
      "info",
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || newReviewText.length < 10) {
      toast("Review content must be at least 10 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const createdReview = {
        id: String(Date.now()),
        author: "You (Verified Diner)",
        avatar: "Y",
        rating: newRating,
        date: "Just now",
        content: newReviewText,
        likes: 0,
      };

      setReviews([createdReview, ...reviews]);
      setNewReviewText("");
      setIsSubmitting(false);
      setShowReviewForm(false);
      toast("Thank you! Your restaurant review has been submitted.", "success");
    }, 800);
  };

  const handleLikeReview = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)),
    );
    toast("Marked review as helpful", "success");
  };

  return (
    <div className="bg-zinc-50 min-h-screen pb-16">
      {/* ── Top Hero & Gallery ────────────────────────────────────────────── */}
      <section className="bg-zinc-900 text-white pt-8 pb-12">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/places" className="hover:text-white">Restaurants</Link>
            <span>/</span>
            <span className="text-zinc-200">{rest.name}</span>
          </div>

          {/* Header Info */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white md:text-5xl">
                  {rest.name}
                </h1>
                {rest.isVerified && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                {rest.category} · {rest.city} · {formatPriceLevel(rest.priceLevel)}
              </p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <StarRating rating={rest.rating} size="lg" />
                <span className="text-xl font-bold text-white">
                  {formatRating(rest.rating)}
                </span>
                <span className="text-sm text-zinc-400">
                  ({rest.reviewCount.toLocaleString("en-IN")} diner reviews)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <MessageSquare className="h-4 w-4" /> Write a Review
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleSave}
                className={cn(
                  "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
                  isSaved && "text-red-500 border-red-500",
                )}
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-red-500")} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-4 h-72 rounded-2xl overflow-hidden">
            <div className="relative sm:col-span-2 h-full bg-zinc-800">
              <Image
                src={rest.photos[0]}
                alt={rest.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {rest.photos.slice(1, 3).map((img, i) => (
              <div key={i} className="relative h-full bg-zinc-800 hidden sm:block">
                <Image src={img} alt="Restaurant Photo" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Detail Grid ──────────────────────────────────────────────── */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Description & Reviews */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* About Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-600" /> About {rest.name}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                {rest.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">
                Amenities & Services
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {rest.amenities.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5 text-sm text-zinc-700">
                    <item.icon className="h-4 w-4 text-red-600" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diner Reviews & Form Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-red-600" /> Diner Reviews ({reviews.length})
                </h2>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                  size="sm"
                >
                  {showReviewForm ? "Cancel Review" : "Write Review"}
                </Button>
              </div>

              {/* Write Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleAddReview}
                  className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 animate-in fade-in"
                >
                  <h3 className="font-bold text-zinc-900 text-sm">
                    Write Your Review for {rest.name}
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 uppercase">
                      Your Star Rating
                    </label>
                    <div className="mt-1">
                      <StarRating
                        rating={newRating}
                        size="lg"
                        interactive
                        onRatingChange={setNewRating}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 uppercase">
                      Your Foodie Experience
                    </label>
                    <textarea
                      rows={4}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share details about the food quality, service, ambiance, and dishes you ordered..."
                      className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Send className="h-4 w-4" /> Submit Review
                    </Button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="flex flex-col divide-y divide-zinc-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white text-sm">
                          {rev.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 text-sm">
                            {rev.author}
                          </p>
                          <p className="text-xs text-zinc-400">{rev.date}</p>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-700">
                      &ldquo;{rev.content}&rdquo;
                    </p>

                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <button
                        onClick={() => handleLikeReview(rev.id)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({rev.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Restaurant Info Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Quick Info Box */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-zinc-900 text-base border-b border-zinc-100 pb-3">
                Location & Contact
              </h3>

              <div className="flex items-start gap-3 text-sm text-zinc-700">
                <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{rest.address}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-700">
                <Phone className="h-4 w-4 text-red-600 shrink-0" />
                <a href={`tel:${rest.phone}`} className="hover:underline">
                  {rest.phone}
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-700">
                <Globe className="h-4 w-4 text-red-600 shrink-0" />
                <a
                  href={rest.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline truncate"
                >
                  Visit Official Website
                </a>
              </div>
            </div>

            {/* Opening Hours Box */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 text-base mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" /> Opening Hours
              </h3>
              <div className="flex flex-col gap-2.5 text-xs">
                {rest.hours.map((h) => (
                  <div key={h.day} className="flex justify-between text-zinc-600">
                    <span className="font-semibold text-zinc-800">{h.day}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
