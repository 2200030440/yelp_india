"use client";

// components/common/MapView.tsx
// Single-place map embed using Leaflet + OpenStreetMap.
// Renders a map centered on the given lat/lng with a custom pin marker.
// Must be rendered client-side only (no SSR) — use dynamic() wrapper in pages.

import { useEffect, useRef, useId } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Leaflet styles — must be loaded once globally. We inject them here.
const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

interface MapViewProps {
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
  /** Map container height (tailwind class or px string) */
  height?: string;
  zoom?: number;
  className?: string;
}

export default function MapView({
  latitude,
  longitude,
  placeName = "Place",
  address,
  height = "h-64",
  zoom = 15,
  className,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const mapId = useId();

  useEffect(() => {
    // Inject Leaflet CSS once
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    let map: import("leaflet").Map | null = null;

    // Lazy-load Leaflet
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const indiaBounds = L.latLngBounds(
        L.latLng(6.5, 68.0),
        L.latLng(35.8, 97.4)
      );

      map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom,
        minZoom: 4,
        maxZoom: 18,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(map);

      // Custom red icon
      const redIcon = L.divIcon({
        html: `<div style="
          width: 32px; height: 32px;
          background: #dc2626;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([latitude, longitude], { icon: redIcon }).addTo(
        map,
      );

      // Rich popup
      marker
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:160px">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${placeName}</p>
            ${address ? `<p style="font-size:11px;color:#666;margin:0">${address}</p>` : ""}
            <a
              href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}"
              target="_blank" rel="noopener noreferrer"
              style="display:inline-block;margin-top:8px;font-size:11px;color:#dc2626;text-decoration:none;font-weight:600"
            >Open in OpenStreetMap ↗</a>
          </div>`,
          { maxWidth: 240 },
        )
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      map?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-zinc-200 shadow-sm", className)}>
      {/* Map attribution bar */}
      <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-2">
        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
        <span className="truncate text-xs font-medium text-white">
          {placeName}
        </span>
      </div>
      <div
        ref={mapContainerRef}
        id={mapId}
        className={cn(height, "w-full")}
        style={{ zIndex: 0 }}
      />
      {/* Directions CTA */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" /> Get Directions via Google Maps
      </a>
    </div>
  );
}
