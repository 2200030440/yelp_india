"use client";

// components/common/PlacesMap.tsx
// Multi-place interactive Leaflet map rendering ALL pins across India simultaneously.
// Supports focusing camera on user location / selected city while preserving all pins across India.

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITY_COORDINATES } from "@/constants";

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
  focusedCity?: string;
  height?: string;
  className?: string;
  onPlaceSelect?: (id: string) => void;
  onLocateUser?: () => void;
}

export default function PlacesMap({
  places,
  activePlaceId,
  userLocation,
  focusedCity,
  height = "h-[600px]",
  className,
  onPlaceSelect,
  onLocateUser,
}: PlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    // Inject Leaflet CSS styles
    const cssLinks = [LEAFLET_CSS, CLUSTER_CSS, CLUSTER_DEFAULT_CSS];
    cssLinks.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    let mapInstance: any = null;

    import("leaflet").then(async (LModule) => {
      const L = LModule.default || LModule;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).L = L;
      // @ts-expect-error — leaflet.markercluster import
      await import("leaflet.markercluster");

      if (!mapContainerRef.current || mapRef.current) return;

      // Fix icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialCenter: [number, number] = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [20.5937, 78.9629];

      mapInstance = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: userLocation ? 12 : 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance);

      // Create Marker Cluster Group
      const clusterGroup = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 45,
      });

      mapInstance.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapRef.current = mapInstance;

      // Trigger initial render of pins once map is ready
      renderMarkers();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        clusterGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to render ALL markers across India dynamically
  const renderMarkers = () => {
    const map = mapRef.current;
    const cluster = clusterGroupRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;

    if (!map || !cluster || !L) return;

    // Clear existing markers
    cluster.clearLayers();
    markersRef.current.clear();

    const validPlaces = places.filter(
      (p) =>
        typeof p.latitude === "number" &&
        typeof p.longitude === "number" &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude) &&
        p.latitude !== 0 &&
        p.longitude !== 0,
    );

    validPlaces.forEach((place) => {
      const isActive = place.id === activePlaceId;

      const iconHtml = `
        <div style="
          width:${isActive ? 38 : 30}px;
          height:${isActive ? 38 : 30}px;
          background:${isActive ? "#dc2626" : "#e11d48"};
          border:2px solid #ffffff;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#ffffff;
          font-size:13px;
          box-shadow:0 4px 10px rgba(0,0,0,0.3);
          cursor:pointer;
          transition:transform 0.15s ease;
        ">
          📍
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [isActive ? 38 : 30, isActive ? 38 : 30],
        iconAnchor: [isActive ? 19 : 15, isActive ? 19 : 15],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
      });

      const popupContent = `
        <div style="width:200px; font-family:system-ui,sans-serif; padding:4px;">
          ${
            place.primaryPhotoUrl
              ? `<img src="${place.primaryPhotoUrl}" style="width:100%;height:95px;object-fit:cover;border-radius:8px;margin-bottom:6px;" />`
              : ""
          }
          <div style="font-weight:700;font-size:13px;color:#111827;line-height:1.2;margin-bottom:2px;">
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
            padding:5px 0;
            border-radius:6px;
            font-size:11px;
            font-weight:700;
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

    focusMapCamera();
  };

  // Focus map camera on focusedCity or userLocation or all places
  const focusMapCamera = () => {
    const map = mapRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!map || !L) return;

    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13, { animate: true });
      return;
    }

    if (focusedCity) {
      const cityLower = focusedCity.toLowerCase().trim();
      const cityPlaces = places.filter((p) => p.city.toLowerCase().includes(cityLower));
      if (cityPlaces.length > 0) {
        const bounds = L.latLngBounds(cityPlaces.map((p) => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        return;
      }
      const coordLookup = CITY_COORDINATES[cityLower];
      if (coordLookup) {
        map.setView([coordLookup.lat, coordLookup.lng], 12, { animate: true });
        return;
      }
    }

    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  };

  // Re-render markers dynamically whenever `places` array updates
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, activePlaceId]);

  // Focus camera when focusedCity changes
  useEffect(() => {
    focusMapCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedCity]);

  // Update user location pin dynamically
  useEffect(() => {
    const map = mapRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;

    if (!map || !L || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      const userIcon = L.divIcon({
        html: `
          <div style="
            width:22px;
            height:22px;
            background:#2563eb;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 0 0 6px rgba(37,99,235,0.3);
          "></div>
        `,
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
      }).bindPopup("<b>📍 You Are Here</b>").addTo(map);
    }

    map.setView([userLocation.latitude, userLocation.longitude], 13, { animate: true });
  }, [userLocation]);

  // Pan to active place when selected from list
  useEffect(() => {
    if (!mapRef.current || !activePlaceId) return;
    const place = places.find((p) => p.id === activePlaceId);
    if (!place || !place.latitude || !place.longitude) return;
    mapRef.current.setView([place.latitude, place.longitude], 14, { animate: true });
    markersRef.current.get(activePlaceId)?.openPopup();
  }, [activePlaceId, places]);

  const validPlacesCount = places.filter((p) => p.latitude && p.longitude).length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 shadow-sm relative flex flex-col",
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold text-white">
            {validPlacesCount} total restaurant pins across India
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onLocateUser && (
            <button
              type="button"
              onClick={onLocateUser}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-2.5 py-1 text-xs font-bold text-white transition-colors"
            >
              📍 Locate Me
            </button>
          )}
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Zoom out to view all India pins
          </span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className={cn(height, "w-full flex-1")}
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
