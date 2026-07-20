import Link from "next/link";
import { Star, Send, Camera, Briefcase } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="container py-12 md:py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900">
                Yelp<span className="text-red-600">India</span>
              </span>
            </Link>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              India&apos;s most trusted restaurant review platform. Discover top-rated dining spots, cafes, and street food.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label="Twitter"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label="Instagram"
              >
                <Camera className="h-3.5 w-3.5" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label="LinkedIn"
              >
                <Briefcase className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {siteConfig.footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 md:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Yelp India. All rights reserved. Built for Restaurant Reviews.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Admin Portal
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
