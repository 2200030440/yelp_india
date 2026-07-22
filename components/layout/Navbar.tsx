"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Star,
  Menu,
  X,
  User,
  Heart,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useLocationContext } from "@/context/LocationContext";
import { MapPin } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { location, detectLocation, isMounted } = useLocationContext();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/places", label: "Restaurants" },
    { href: "/map", label: "📍 Near Me" },
    { href: "/search", label: "Search Food" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-b border-zinc-200 bg-white",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & GPS Location Pill */}
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 transition-colors group-hover:bg-red-700">
              <Star className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Yelp<span className="text-red-600">India</span>
            </span>
          </Link>

          {/* Live GPS Location Pill */}
          <button
            type="button"
            onClick={detectLocation}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Click to detect current GPS location"
          >
            <MapPin className="h-3.5 w-3.5 text-red-600" />
            <span suppressHydrationWarning>
              {!isMounted
                ? "Hyderabad"
                : location.status === "locating"
                ? "Locating..."
                : location.city}
            </span>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-red-600 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop User / Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pr-3 transition-colors hover:bg-zinc-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 font-bold text-xs text-white">
                  {session.user.name ? session.user.name[0]?.toUpperCase() : "U"}
                </div>
                <span className="text-sm font-semibold text-zinc-800">
                  {session.user.name ?? session.user.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-zinc-100 px-3 py-2">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <User className="h-4 w-4 text-zinc-400" /> My Profile
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <Heart className="h-4 w-4 text-zinc-400" /> Saved Places
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Shield className="h-4 w-4 text-red-600" /> Admin Portal
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-zinc-100 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-zinc-700" />
          ) : (
            <Menu className="h-5 w-5 text-zinc-700" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileOpen && (
        <div className="flex flex-col gap-1 border-t border-zinc-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-zinc-200 pt-2">
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  My Profile ({session.user.name})
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg border border-zinc-200 px-3 py-2.5 text-center text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg border border-zinc-200 px-3 py-2.5 text-center text-sm font-medium text-zinc-700"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg bg-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
