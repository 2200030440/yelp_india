"use client";
// app/(main)/places/[slug]/PlaceSaveButton.tsx
// Save/unsave button — syncs with FavoritesContext & /api/favorites

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";

interface Props {
  placeId:   string;
  placeName: string;
  slug?:     string;
}

export default function PlaceSaveButton({ placeId, placeName, slug }: Props) {
  const { isSaved, toggleSave } = useFavorites();
  const [loading, setLoading] = useState(false);

  const identifier = slug || placeId;
  const saved = isSaved(identifier) || isSaved(placeId);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleSave({ id: placeId, slug: slug || placeId, name: placeName });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 gap-2",
        saved && "border-red-500 text-red-400 bg-red-950/40",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
      ) : (
        <Heart className={cn("h-4 w-4 transition-colors", saved ? "fill-red-500 text-red-500" : "text-white")} />
      )}
      {saved ? "Saved to Wishlist" : "Save"}
    </Button>
  );
}
