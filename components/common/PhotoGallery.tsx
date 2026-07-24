"use client";

// components/common/PhotoGallery.tsx
// Sleek, Premium Single Banner Hero & Lightbox Gallery

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Images,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryPhoto {
  url: string;
  publicId?: string;
  caption?: string | null;
  isPrimary?: boolean;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  placeName?: string;
  className?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80";

export default function PhotoGallery({
  photos,
  placeName = "Place",
  className,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const primaryPhoto = (photos && photos.find((p) => p.isPrimary)) || (photos && photos[0]);
  const [heroSrc, setHeroSrc] = useState(primaryPhoto?.url || FALLBACK_IMAGE);

  const isOpen = lightboxIndex !== null;
  const current = isOpen ? photos[lightboxIndex!] : null;

  // Keyboard navigation
  const navigate = useCallback(
    (direction: "prev" | "next") => {
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        if (direction === "prev") return (prev - 1 + photos.length) % photos.length;
        return (prev + 1) % photos.length;
      });
    },
    [photos.length],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, navigate, closeLightbox]);

  if (!photos || photos.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 flex-col items-center justify-center rounded-3xl bg-zinc-900 text-zinc-500 border border-zinc-800",
          className,
        )}
      >
        <Images className="h-10 w-10 mb-2 text-zinc-600" />
        <p className="text-sm font-medium">No photos available</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Single Clean Hero Banner ────────────────────────────────────────── */}
      <div
        className={cn(
          "group relative h-80 sm:h-96 w-full cursor-pointer overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20",
          className,
        )}
        onClick={() => setLightboxIndex(0)}
        role="button"
        tabIndex={0}
        aria-label={`View photo of ${placeName}`}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLightboxIndex(0)}
      >
        <Image
          src={heroSrc}
          alt={primaryPhoto?.caption ?? `${placeName} main photo`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
          onError={() => setHeroSrc(FALLBACK_IMAGE)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* View Fullscreen Pill Button */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all group-hover:bg-black/80 group-hover:scale-105">
          <Maximize2 className="h-4 w-4 text-red-500" />
          <span>View HD Photo {photos.length > 1 && `(${photos.length})`}</span>
        </div>
      </div>

      {/* ── Lightbox Modal ─────────────────────────────────────────────────── */}
      {isOpen && current && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="mb-3 flex w-full items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {lightboxIndex! + 1} / {photos.length} · {placeName}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={current.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Download photo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={closeLightbox}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-red-600 transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Photo Display */}
            <div className="relative max-h-[75vh] w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl bg-black flex items-center justify-center">
              <Image
                key={current.url}
                src={current.url}
                alt={current.caption ?? `${placeName} photo`}
                width={1200}
                height={800}
                className="max-h-[75vh] w-auto max-w-full object-contain"
                unoptimized
              />
            </div>

            {/* Caption */}
            {current.caption && (
              <p className="mt-3 text-xs text-white/80 text-center font-medium">
                {current.caption}
              </p>
            )}

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 max-w-full">
                {photos.map((photo, idx) => (
                  <button
                    key={photo.url + idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={cn(
                      "relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      lightboxIndex === idx
                        ? "border-red-500 scale-105"
                        : "border-transparent opacity-50 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("prev");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
