"use client";

// components/common/PlacesMap.tsx
// Multi-place interactive map with:
//  - Cluster markers (auto-group nearby pins)
//  - Hover/click popups with place info card
//  - Fit-bounds to show all markers
//  - Highlighted active place
//  - Used on /places page in Map view mode

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const CLUSTER_CSS =
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
const CLUSTER_DEFAULT_CSS =
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";

export interface PlacePin {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  city: string;
  averageRating: number;
  reviewCount: number;
  priceLevel?: number;
  category?: string;
  primaryPhotoUrl?: string;
}

interface PlacesMapProps {
  places: PlacePin[];
  activePlaceId?: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
  height?: string;
  className?: string;
  onPlaceSelect?: (id: string) => void;
  onLocateUser?: () => void;
}

export default function PlacesMap({
  places,
  activePlaceId,
  userLocation,
  height = "h-[600px]",
  className,
  onPlaceSelect,
  onLocateUser,
}: PlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null);

  useEffect(() => {
    // Inject CSS
    const cssLinks = [LEAFLET_CSS, CLUSTER_CSS, CLUSTER_DEFAULT_CSS];
    cssLinks.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    let map: import("leaflet").Map | null = null;

    // Load Leaflet + MarkerCluster dynamically
    import("leaflet").then(async (LModule) => {
      const L = LModule.default || LModule;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).L = L;
      // @ts-expect-error — no typings for leaflet.markercluster
      await import("leaflet.markercluster");

      if (!mapContainerRef.current || mapRef.current) return;

      // Fix icon paths
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

      // Bounding box strictly locked to India territory
      const indiaBounds = L.latLngBounds(
        L.latLng(6.5, 68.0),  // South-West
        L.latLng(35.8, 97.4)  // North-East
      );

      const center: [number, number] = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : places.length === 1
        ? [places[0].latitude, places[0].longitude]
        : [20.5937, 78.9629]; // Geographic center of India

      map = L.map(mapContainerRef.current, {
        center,
        zoom: userLocation ? 13 : places.length === 1 ? 14 : 5,
        minZoom: 4,
        maxZoom: 18,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Marker cluster group
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
      });

      places.forEach((place) => {
        const isActive = place.id === activePlaceId;

        const iconHtml = `
          <div style="
            width:${isActive ? 40 : 32}px;
            height:${isActive ? 40 : 32}px;
            background:${isActive ? "#dc2626" : "#000"};
            border:2px solid #fff;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-size:12px;
            font-weight:bold;
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            transition:transform 0.2s ease;
          ">
            🍛
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [isActive ? 40 : 32, isActive ? 40 : 32],
          iconAnchor: [isActive ? 20 : 16, isActive ? 20 : 16],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([place.latitude, place.longitude], {
          icon: customIcon,
        });

        const popupContent = `
          <div style="width:200px; font-family:system-ui,sans-serif; padding:4px;">
            ${
              place.primaryPhotoUrl
                ? `<img src="${place.primaryPhotoUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
                : ""
            }
            <div style="font-weight:700;font-size:14px;color:#111827;line-height:1.2;margin-bottom:2px;">
              ${place.name}
            </div>
            <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">
              ${place.category ?? "Restaurant"} · ${place.city}
            </div>
            <a href="/places/${place.slug}" style="
              display:inline-block;
              width:100%;
              text-align:center;
              background:#dc2626;
              color:#fff;
              text-decoration:none;
              padding:6px 0;
              border-radius:6px;
              font-size:12px;
              font-weight:600;
              margin-top:4px;
            ">
              View Details →
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 220 });

        if (onPlaceSelect) {
          marker.on("click", () => onPlaceSelect(place.id));
        }

        cluster.addLayer(marker);
        markersRef.current.set(place.id, marker);
      });

      map.addLayer(cluster);

      // Add User Location Pin if available
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `
            <div style="
              width:24px;
              height:24px;
              background:#2563eb;
              border:3px solid #fff;
              border-radius:50%;
              box-shadow:0 0 0 8px rgba(37,99,235,0.25);
              animation:pulse 2s infinite;
            "></div>
          `,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const uMarker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        }).bindPopup("<b>📍 You Are Here</b>").addTo(map);
        userMarkerRef.current = uMarker;
      }

      // Fit to all markers if no user location
      if (!userLocation && places.length > 1) {
        const bounds = L.latLngBounds(
          places.map((p) => [p.latitude, p.longitude]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

      mapRef.current = map;
    });

    const currentMarkers = markersRef.current;
    return () => {
      map?.remove();
      mapRef.current = null;
      currentMarkers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location pin dynamically
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13, {
      animate: true,
    });
  }, [userLocation]);

  // Pan + highlight active place when it changes
  useEffect(() => {
    if (!mapRef.current || !activePlaceId) return;
    const place = places.find((p) => p.id === activePlaceId);
    if (!place) return;
    mapRef.current.setView([place.latitude, place.longitude], 14, {
      animate: true,
    });
    markersRef.current.get(activePlaceId)?.openPopup();
  }, [activePlaceId, places]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 shadow-sm relative",
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold text-white">
            {places.length} place{places.length !== 1 ? "s" : ""} on India map
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onLocateUser && (
            <button
              onClick={onLocateUser}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-2.5 py-1 text-xs font-bold text-white transition-colors"
            >
              📍 Locate Me
            </button>
          )}
          <span className="text-xs text-zinc-400 hidden sm:inline">
            India Only · OpenStreetMap
          </span>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className={cn(height, "w-full")}
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
