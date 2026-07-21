"use client";

// components/common/PhotoGallery.tsx
// Responsive photo gallery with:
//  - Grid layout (masonry-style)
//  - Full-screen lightbox modal with keyboard nav (←/→/Esc)
//  - Download button
//  - Caption support

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  url: string;
  publicId?: string;
  caption?: string | null;
  isPrimary?: boolean;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  placeName?: string;
  /** Show max N photos in the grid, rest hidden behind a +N overlay */
  maxVisible?: number;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PhotoGallery({
  photos,
  placeName = "Place",
  maxVisible = 5,
  className,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
    // Prevent body scroll while lightbox is open
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
          "flex h-48 flex-col items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400",
          className,
        )}
      >
        <Images className="h-10 w-10 mb-2" />
        <p className="text-sm">No photos yet</p>
      </div>
    );
  }

  const visiblePhotos = photos.slice(0, maxVisible);
  const remaining = photos.length - maxVisible;

  return (
    <>
      {/* ── Gallery Grid ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "grid h-72 gap-2 overflow-hidden rounded-2xl",
          photos.length === 1
            ? "grid-cols-1"
            : photos.length === 2
              ? "grid-cols-2"
              : photos.length === 3
                ? "grid-cols-3"
                : "grid-cols-4",
          className,
        )}
      >
        {visiblePhotos.map((photo, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === visiblePhotos.length - 1;
          const hasMore = isLast && remaining > 0;

          return (
            <div
              key={photo.url + idx}
              className={cn(
                "group relative cursor-pointer overflow-hidden bg-zinc-800",
                isFirst && photos.length > 1 && "col-span-2 row-span-2",
              )}
              onClick={() => setLightboxIndex(idx)}
              role="button"
              tabIndex={0}
              aria-label={`View photo ${idx + 1} of ${photos.length}`}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setLightboxIndex(idx)
              }
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? `${placeName} photo ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={isFirst}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {/* "More" overlay on last visible */}
              {hasMore && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <span className="text-2xl font-extrabold text-white">
                    +{remaining}
                  </span>
                  <span className="text-xs text-white/80 mt-1">more photos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {isOpen && current && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          {/* Image container */}
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="mb-3 flex w-full items-center justify-between">
              <span className="text-sm text-white/60">
                {lightboxIndex! + 1} / {photos.length}
                {placeName && (
                  <span className="ml-2 text-white/40">· {placeName}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {/* Download */}
                <a
                  href={current.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Download photo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                </a>
                {/* Close */}
                <button
                  onClick={closeLightbox}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-red-600 transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main photo */}
            <div className="relative max-h-[75vh] w-full overflow-hidden rounded-xl">
              <Image
                key={current.url}
                src={current.url}
                alt={current.caption ?? `${placeName} photo`}
                width={1200}
                height={800}
                className="max-h-[75vh] w-full object-contain"
                unoptimized
              />
            </div>

            {/* Caption */}
            {current.caption && (
              <p className="mt-3 text-sm text-white/70 text-center max-w-lg">
                {current.caption}
              </p>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 max-w-full">
                {photos.map((photo, idx) => (
                  <button
                    key={photo.url + idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={cn(
                      "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      lightboxIndex === idx
                        ? "border-red-500 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80",
                    )}
                    aria-label={`Jump to photo ${idx + 1}`}
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

          {/* Prev / Next navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("prev");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
