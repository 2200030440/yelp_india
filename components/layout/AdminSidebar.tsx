"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  MessageSquare,
  Users,
  Star,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Restaurants",
    href: "/admin/places",
    icon: UtensilsCrossed,
  },
  {
    title: "Reviews & Ratings",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-900 text-white min-h-screen">
      {/* Admin Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <Star className="h-4 w-4 fill-white text-white" />
          </div>
          <span className="font-bold tracking-tight">
            Yelp<span className="text-red-500">Admin</span>
          </span>
        </Link>
        <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-800">
          PROD
        </span>
      </div>

      {/* Admin Nav */}
      <div className="flex-1 px-4 py-6">
        <div className="mb-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Management
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-zinc-800 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-800/80 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white text-sm">
            AD
          </div>
          <div className="overflow-hidden text-xs">
            <p className="font-semibold text-white truncate">System Administrator</p>
            <p className="text-zinc-400 truncate flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400 inline" /> Super Admin
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Main Site
        </Link>
      </div>
    </aside>
  );
}
