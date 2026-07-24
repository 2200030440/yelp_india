"use client";

// app/(main)/profile/page.tsx
// User Profile Page with Gamification, Level Badges, Activity Breakdown & Account Settings

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Mail,
  MapPin,
  Calendar,
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
  Award,
  ThumbsUp,
  Image as ImageIcon,
  Sparkles,
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

interface DinerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"reviews" | "badges" | "edit" | "security">("reviews");
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
      usersApi
        .me()
        .then(({ user }) => {
          if (user) {
            setName(user.name ?? session.user.name ?? session.user.email?.split("@")[0] ?? "User");
            if (user.city) setCity(user.city);
            if (user.bio) setBio(user.bio);
            if (user.createdAt) {
              const d = new Date(user.createdAt);
              setJoinedDate(d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
            }
            if (user.reviews) {
              setReviews(
                user.reviews.map((r: { id: string; rating: number; content: string; createdAt: Date | string; place?: { name?: string; slug?: string; city?: string }; _count?: { likes?: number } }) => ({
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
          } else {
            setName(session.user.name ?? session.user.email?.split("@")[0] ?? "User");
          }
        })
        .catch(() => {
          setReviews([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [session]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await usersApi.update({ name, city, bio });
      if (res?.user) {
        setName(res.user.name || name);
        if (res.user.city) setCity(res.user.city);
        if (res.user.bio) setBio(res.user.bio);
      }
      toast("Profile updated successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast("Please fill in both current and new password fields.", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters long.", "error");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      toast(data.message || "Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast(err.message || "Failed to change password", "error");
    } finally {
      setIsChangingPassword(false);
    }
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
  const totalLikes = reviews.reduce((sum, r) => sum + r.likes, 0);

  // Dynamic Diner Badges
  const dinerBadges: DinerBadge[] = [
    {
      id: "b1",
      name: "Foodie Explorer",
      description: "Write your first diner review in India",
      icon: "🥉",
      unlocked: reviews.length >= 1,
      progress: Math.min(100, (reviews.length / 1) * 100),
    },
    {
      id: "b2",
      name: "Top Critic",
      description: "Write 5+ detailed restaurant reviews",
      icon: "🥈",
      unlocked: reviews.length >= 5,
      progress: Math.min(100, (reviews.length / 5) * 100),
    },
    {
      id: "b3",
      name: "Master Gourmet",
      description: "Write 10+ reviews & discover top dining spots",
      icon: "🥇",
      unlocked: reviews.length >= 10,
      progress: Math.min(100, (reviews.length / 10) * 100),
    },
    {
      id: "b4",
      name: "Community Guide",
      description: "Receive 5+ helpful votes from other foodies",
      icon: "🌟",
      unlocked: totalLikes >= 5,
      progress: Math.min(100, (totalLikes / 5) * 100),
    },
  ];

  const highestRank = reviews.length >= 10 ? "Master Gourmet" : reviews.length >= 5 ? "Top Critic" : reviews.length >= 1 ? "Foodie Explorer" : "New Diner";

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4">
      <div className="container max-w-5xl">
        {/* Header Profile Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
                <Badge variant="brand" className="gap-1 bg-red-600 text-white">
                  <Award className="h-3.5 w-3.5" /> {highestRank}
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

        {/* Activity Breakdown Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1 text-red-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-xl font-extrabold text-zinc-900">{reviews.length}</p>
            <p className="text-xs font-medium text-zinc-500">Reviews Written</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1 text-amber-500">
              <ThumbsUp className="h-5 w-5" />
            </div>
            <p className="text-xl font-extrabold text-zinc-900">{totalLikes}</p>
            <p className="text-xs font-medium text-zinc-500">Helpful Votes</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-xl font-extrabold text-zinc-900">
              {dinerBadges.filter((b) => b.unlocked).length}/{dinerBadges.length}
            </p>
            <p className="text-xs font-medium text-zinc-500">Badges Earned</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1 text-blue-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="text-xl font-extrabold text-zinc-900">{reviews.length * 2}</p>
            <p className="text-xs font-medium text-zinc-500">Food Photos</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 mb-8 overflow-x-auto">
          {[
            { id: "reviews", label: `My Reviews (${reviews.length})`, icon: MessageSquare },
            { id: "badges", label: "Badges & Level", icon: Award },
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

        {/* Tab 2: Badges & Gamification */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dinerBadges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  "rounded-2xl border p-5 transition-all flex flex-col gap-3",
                  badge.unlocked
                    ? "border-emerald-200 bg-emerald-50/40 shadow-sm"
                    : "border-zinc-200 bg-white opacity-70",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{badge.icon}</span>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-base">{badge.name}</h3>
                      <p className="text-xs text-zinc-500">{badge.description}</p>
                    </div>
                  </div>
                  {badge.unlocked ? (
                    <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                      <Sparkles className="h-3 w-3" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                      Locked
                    </Badge>
                  )}
                </div>

                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className={cn(
                      "h-2 transition-all duration-500 rounded-full",
                      badge.unlocked ? "bg-emerald-500" : "bg-red-500",
                    )}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Edit Profile */}
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

        {/* Tab 4: Security */}
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
              <Button type="submit" isLoading={isChangingPassword}>
                <CheckCircle2 className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
