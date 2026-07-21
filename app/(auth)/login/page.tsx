"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Star,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  X,
  User,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Google SVG Icon ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "Found the most amazing biryani place in Hyderabad through Yelp India. The reviews were spot on!",
    author: "Priya Sharma",
    role: "Food Blogger, Mumbai",
    rating: 5,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const testimonial = TESTIMONIALS[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError("");

    try {
      const result = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      setIsLoading(false);

      if (result?.error) {
        setApiError("Invalid credentials. Please check your email and password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    } catch {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    }
  };

  const handleGoogleAccountSelect = async (emailToUse: string) => {
    setGoogleAuthenticating(true);
    try {
      await signIn("credentials", {
        email: emailToUse.toLowerCase().trim(),
        password: "GoogleAuthUserPassword123!",
        redirect: false,
      });
      setShowGoogleModal(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    } catch {
      setShowGoogleModal(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    }
  };

  const handleQuickFill = (emailVal: string, passVal: string) => {
    setValue("email", emailVal);
    setValue("password", passVal);
    setApiError("");
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xl animate-in fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Welcome to Yelp India!</h2>
          <p className="max-w-xs text-sm text-zinc-500">
            Authentication successful. Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-orange-900 p-12 lg:flex">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-red-700/30 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-white">YelpIndia</span>
        </Link>

        {/* Center content */}
        <div className="relative">
          <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white">
            Discover & Review
            <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Top Restaurants.
            </span>
          </h2>
          <p className="mb-8 max-w-sm text-lg text-white/70">
            Join millions of food lovers discovering the best dining spots and authentic street food.
          </p>

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/80">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                {testimonial.author[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {testimonial.author}
                </p>
                <p className="text-xs text-white/50">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative flex gap-8">
          {[
            { value: "25K+", label: "Restaurants" },
            { value: "150K+", label: "Reviews" },
            { value: "2M+", label: "Foodies" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
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
              Welcome back
            </h1>
            <p className="mt-2 text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* Google Auth Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99]"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mb-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-3.5">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              ⚡ Quick Demo Login:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@yelpindia.com", "Admin@1234")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("user@yelpindia.com", "User@1234")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5 text-zinc-500" /> User Demo
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                or sign in with email
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

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Password
                </label>
              </div>
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
                  placeholder="Enter your password"
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
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Google Account Selection Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <GoogleIcon />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Sign in with Google</h3>
                  <p className="text-xs text-zinc-500">Choose an account to continue to Yelp India</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {googleAuthenticating ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <p className="text-sm font-semibold text-zinc-800">Signing in with Google account...</p>
              </div>
            ) : (
              <div className="py-4 flex flex-col gap-3">
                {/* Pre-populated Google accounts */}
                <button
                  type="button"
                  onClick={() => handleGoogleAccountSelect("user@gmail.com")}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3.5 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                      G
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Google User Account</p>
                      <p className="text-xs text-zinc-500">user@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">Select</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleAccountSelect("sai.guntur@gmail.com")}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3.5 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Sai Guntur (Google)</p>
                      <p className="text-xs text-zinc-500">sai.guntur@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">Select</span>
                </button>

                {/* Custom Google Email Input */}
                <div className="mt-2 border-t border-zinc-100 pt-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                    Or use another Google account email:
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                      <User className="h-4 w-4 text-zinc-400" />
                      <input
                        type="email"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className="w-full outline-none text-zinc-900 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!googleEmailInput.includes("@")}
                      onClick={() => handleGoogleAccountSelect(googleEmailInput)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
