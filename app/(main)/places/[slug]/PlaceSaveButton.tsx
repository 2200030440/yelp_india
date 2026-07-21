"use client";
// app/(main)/places/[slug]/PlaceSaveButton.tsx
// Save/unsave button — syncs with /api/favorites

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { favoritesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  placeId:   string;
  placeName: string;
  saved?:    boolean;
}

export default function PlaceSaveButton({ placeId, placeName, saved = false }: Props) {
  const { data: session } = useSession();
  const router            = useRouter();
  const { toast }         = useToast();
  const [isSaved, setIsSaved] = useState(saved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      if (isSaved) {
        await favoritesApi.remove(placeId);
        setIsSaved(false);
        toast(`Removed "${placeName}" from saved places`, "info");
      } else {
        await favoritesApi.add(placeId);
        setIsSaved(true);
        toast(`"${placeName}" added to your saved places!`, "success");
      }
    } catch {
      toast("Something went wrong. Please try again.", "error");
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
        isSaved && "border-red-500 text-red-400",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")} />
      )}
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
