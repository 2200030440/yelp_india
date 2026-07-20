"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Star,
  ArrowRight,
  Loader2,
  Globe,
  GitBranch,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Check,
  Shield,
  Zap,
  Utensils,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { registerUserAction } from "@/features/auth/actions/auth-actions";
import { cn } from "@/lib/utils";

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms to continue",
      }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password Strength Indicator ─────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Strong"];

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < passed ? colors[passed - 1] : "bg-zinc-200",
            )}
          />
        ))}
        <span
          className={cn(
            "text-xs font-medium",
            passed === 3
              ? "text-emerald-600"
              : passed === 2
                ? "text-amber-600"
                : "text-red-500",
          )}
        >
          {labels[passed - 1] ?? "Weak"}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => (
          <span
            key={rule.label}
            className={cn(
              "flex items-center gap-1 text-xs",
              rule.test(password) ? "text-emerald-600 font-medium" : "text-zinc-400",
            )}
          >
            <Check className="h-3 w-3" />
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError("");

    const res = await registerUserAction({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (!res.success) {
      setApiError(res.error ?? "Failed to create account.");
      return;
    }

    setSuccess(true);
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setApiError(`Failed to connect with ${provider}.`);
      setSocialLoading(null);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl md:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Account Created Successfully! 🎉
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            Welcome to Yelp India! Your account is ready. Please sign in to explore restaurants and submit reviews.
          </p>
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              Sign In to Your Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel (hidden on mobile) ─────────────────────────────────── */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950 p-12 lg:flex">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-white">YelpIndia</span>
        </Link>

        {/* Center content */}
        <div className="relative">
          <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white">
            Join 2 Million+
            <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Food Lovers & Diners
            </span>
          </h2>

          {/* Benefits */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Utensils,
                title: "Restaurant Discovery",
                desc: "Find the best dining spots in over 500 Indian cities.",
              },
              {
                icon: Shield,
                title: "Verified Diner Reviews",
                desc: "Authentic reviews and food photos from real diners.",
              },
              {
                icon: Zap,
                title: "Save Favourites",
                desc: "Bookmark restaurants and create personal foodie wishlists.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <benefit.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {benefit.title}
                  </p>
                  <p className="text-sm text-white/50">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative flex gap-8">
          {[
            { value: "Free", label: "Always" },
            { value: "500+", label: "Cities" },
            { value: "4.9★", label: "App Rating" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Register Form ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900">
                Yelp<span className="text-red-600">India</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900">
              Create your account
            </h1>
            <p className="mt-2 text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Social Auth */}
          <div className="mb-6 flex flex-col gap-3">
            <SocialButton
              icon={Globe}
              label={
                socialLoading === "google"
                  ? "Connecting to Google…"
                  : "Sign up with Google"
              }
              onClick={() => handleSocialSignup("google")}
              disabled={isLoading || socialLoading !== null}
            />
            <SocialButton
              icon={GitBranch}
              label={
                socialLoading === "github"
                  ? "Connecting to GitHub…"
                  : "Sign up with GitHub"
              }
              onClick={() => handleSocialSignup("github")}
              disabled={isLoading || socialLoading !== null}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                or register with email
              </span>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {apiError}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700">
                Full name
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all focus-within:ring-2",
                  errors.name
                    ? "border-red-300 focus-within:ring-red-200"
                    : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-100",
                )}
              >
                <User className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Rahul Sharma"
                  className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email address
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all focus-within:ring-2",
                  errors.email
                    ? "border-red-300 focus-within:ring-red-200"
                    : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-100",
                )}
              >
                <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all focus-within:ring-2",
                  errors.password
                    ? "border-red-300 focus-within:ring-red-200"
                    : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-100",
                )}
              >
                <Lock className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={passwordValue} />
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                Confirm password
              </label>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all focus-within:ring-2",
                  errors.confirmPassword
                    ? "border-red-300 focus-within:ring-red-200"
                    : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-100",
                )}
              >
                <Lock className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="mt-1 flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-red-600 accent-red-600 focus:ring-red-500"
                  {...register("terms")}
                />
                <span className="text-sm leading-snug text-zinc-600">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-red-600 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-red-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || socialLoading !== null}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
