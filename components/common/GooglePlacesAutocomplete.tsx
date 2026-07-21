"use client";

// components/common/GooglePlacesAutocomplete.tsx
// Real-Time Google Places & Location Search Autocomplete Input Component

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2, Sparkles } from "lucide-react";
import { syncPlaceAction } from "@/actions/place-actions";

interface Suggestion {
  id?: string;
  slug?: string;
  googlePlaceId?: string;
  text: string;
  mainText: string;
  secondaryText: string;
}

interface Props {
  placeholder?: string;
  className?: string;
  onSelect?: (text: string) => void;
}

export default function GooglePlacesAutocomplete({
  placeholder = "Search restaurants, biryani, or cities across India…",
  className = "",
  onSelect,
}: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced API search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input.trim() || input.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn("Autocomplete error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [input]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = async (item: Suggestion) => {
    setIsOpen(false);
    setInput(item.mainText);
    if (onSelect) {
      onSelect(item.text);
    }

    if (item.slug) {
      router.push(`/places/${item.slug}`);
      return;
    }

    if (item.googlePlaceId) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places/google-search?googlePlaceId=${item.googlePlaceId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.place) {
            const syncRes = await syncPlaceAction({
              name: data.place.name,
              address: data.place.address,
              city: data.place.city,
              latitude: data.place.latitude,
              longitude: data.place.longitude,
              phone: data.place.phone,
              website: data.place.website,
              photoUrl: data.place.photos?.[0],
              googlePlaceId: item.googlePlaceId,
            });
            if (syncRes.success && syncRes.place) {
              router.push(`/places/${syncRes.place.slug}`);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Place details fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    router.push(`/search?q=${encodeURIComponent(item.mainText)}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-12 pr-10 text-sm font-medium text-zinc-900 shadow-sm transition-all outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 h-4 w-4 animate-spin text-red-600" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl animate-in fade-in duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Real-time India Suggestions
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={item.googlePlaceId || item.id || idx}
              onClick={() => handleSelectSuggestion(item)}
              className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-red-50/70"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-zinc-900 truncate">
                  {item.mainText}
                </span>
                <span className="text-xs text-zinc-500 truncate">
                  {item.secondaryText}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
