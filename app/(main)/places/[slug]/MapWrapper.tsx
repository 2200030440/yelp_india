"use client";
// app/(main)/places/[slug]/MapWrapper.tsx
// Client component wrapper for MapView — needed because ssr:false is only
// allowed inside client components.

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const MapView = dynamic(() => import("@/components/common/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center rounded-2xl bg-zinc-100">
      <MapPin className="h-6 w-6 animate-pulse text-zinc-400" />
    </div>
  ),
});

interface Props {
  latitude:  number;
  longitude: number;
  placeName: string;
  address:   string;
}

export default function MapWrapper({ latitude, longitude, placeName, address }: Props) {
  return (
    <MapView
      latitude={latitude}
      longitude={longitude}
      placeName={placeName}
      address={address}
      height="h-56"
    />
  );
}
