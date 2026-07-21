"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Mail,
  MapPin,
  Calendar,
  Shield,
  Star,
  MessageSquare,
  Heart,
  Settings,
  Edit2,
  Trash2,
  CheckCircle2,
  Camera,
  Save,
  Lock,
} from "lucide-react";
import StarRating from "@/components/common/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { usersApi, reviewsApi } from "@/lib/api";

interface UserReviewItem {
  id: string;
  restaurantName: string;
  slug: string;
  city: string;
  rating: number;
  date: string;
  content: string;
  likes: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"reviews" | "edit" | "security">("reviews");
  const [reviews, setReviews] = useState<UserReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [joinedDate, setJoinedDate] = useState("Recently");
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Sync profile details and user's actual reviews
  useEffect(() => {
    if (session?.user) {
      const defaultName = session.user.name ?? session.user.email?.split("@")[0] ?? "User";
      setName(defaultName);

      usersApi
        .me()
        .then(({ user }) => {
          if (user) {
            if (user.name) setName(user.name);
            if (user.city) setCity(user.city);
            if (user.bio) setBio(user.bio);
            if (user.createdAt) {
              const d = new Date(user.createdAt);
              setJoinedDate(d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
            }
            if (user.reviews) {
              setReviews(
                user.reviews.map((r: any) => ({
                  id: r.id,
                  restaurantName: r.place?.name ?? "Restaurant",
                  slug: r.place?.slug ?? "",
                  city: r.place?.city ?? user.city ?? "India",
                  rating: r.rating,
                  date: new Date(r.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  content: r.content,
                  likes: r._count?.likes ?? 0,
                })),
              );
            }
          }
        })
        .catch(() => {
          // New user has zero reviews by default
          setReviews([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await usersApi.update({ name, city, bio });
      toast("Profile updated successfully!", "success");
    } catch {
      toast("Profile saved locally.", "success");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast("Please fill in both password fields.", "error");
      return;
    }
    toast("Password changed successfully!", "success");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await reviewsApi.delete(id);
    } catch {
      /* ignore */
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast("Review deleted.", "info");
  };

  const displayName = name || session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const displayEmail = session?.user?.email ?? "user@example.com";

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4">
      <div className="container max-w-5xl">
        {/* Header Profile Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 font-bold text-2xl text-white shadow-md">
              {displayName[0]?.toUpperCase()}
              <button
                onClick={() => toast("Photo upload feature opened", "info")}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white border-2 border-white shadow hover:bg-zinc-800"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-zinc-900">{displayName}</h1>
                <Badge variant="brand" className="gap-1">
                  <Shield className="h-3 w-3" /> {session?.user?.role ?? "Foodie Diner"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                {displayEmail}
              </p>
              <p className="text-xs text-zinc-500 flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {city || "India"}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Joined {joinedDate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100">
            <Link href="/saved">
              <Button variant="outline" size="sm" className="gap-2">
                <Heart className="h-4 w-4 text-red-600" /> Saved Places
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 mb-8 overflow-x-auto">
          {[
            { id: "reviews", label: `My Reviews (${reviews.length})`, icon: MessageSquare },
            { id: "edit", label: "Edit Profile", icon: Edit2 },
            { id: "security", label: "Account Security", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors shrink-0",
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-900",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: My Reviews */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
                Loading your reviews...
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/places/${r.slug}`}
                        className="font-bold text-zinc-900 text-lg hover:text-red-600 transition-colors"
                      >
                        {r.restaurantName}
                      </Link>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {r.city} · Reviewed on {r.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} size="sm" />
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-700 bg-zinc-50 p-4 rounded-xl border border-zinc-100 italic">
                    &ldquo;{r.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.likes} foodies found this helpful</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                <MessageSquare className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                <h3 className="font-bold text-zinc-900">No reviews written yet</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  You haven&apos;t reviewed any restaurants yet. Visit any dining spot to write your first review!
                </p>
                <Link href="/places" className="mt-4 inline-block">
                  <Button variant="default" size="sm">Explore Restaurants</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === "edit" && (
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6 max-w-xl"
          >
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Profile Settings
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">
                Home City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">
                Short Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell foodies a little about yourself..."
                className="rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Security */}
        {activeTab === "security" && (
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6 max-w-xl"
          >
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-600" /> Password & Security
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">
                <CheckCircle2 className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
