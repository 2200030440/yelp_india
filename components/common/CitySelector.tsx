"use client";

// components/common/CitySelector.tsx
// Premium, custom-styled City Dropdown Selector for Yelp India
// Dynamically fetches seeded cities from database & handles spelling aliases

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIAN_CITIES } from "@/constants";

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_CITIES = [
  "Vijayawada",
  "Hyderabad",
  "Guntur",
  "Bengaluru",
  "Mumbai",
  "New Delhi",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Goa",
];

const SPELLING_ALIASES: Record<string, string> = {
  vijawada: "Vijayawada",
  vijaywada: "Vijayawada",
  vizag: "Visakhapatnam",
  bangalore: "Bengaluru",
};

export default function CitySelector({
  value,
  onChange,
  placeholder = "Select City...",
  className,
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dynamicCities, setDynamicCities] = useState<Array<{ name: string; count: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch live cities from database
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch("/api/cities");
        if (res.ok) {
          const data = await res.json();
          if (data.cities && Array.isArray(data.cities)) {
            setDynamicCities(data.cities);
          }
        }
      } catch {
        /* Fallback */
      }
    }
    loadCities();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Merge static cities + dynamic seeded cities
  const allCitiesMap = new Map<string, number>();
  dynamicCities.forEach((c) => allCitiesMap.set(c.name, c.count));
  INDIAN_CITIES.forEach((c) => {
    if (!allCitiesMap.has(c)) allCitiesMap.set(c, 0);
  });

  const cityList = Array.from(allCitiesMap.entries()).map(([name, count]) => ({ name, count }));

  const filteredCities = cityList.filter(({ name }) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    const aliasResolved = SPELLING_ALIASES[s] || s;
    return name.toLowerCase().includes(aliasResolved.toLowerCase());
  });

  const handleSelect = (cityName: string) => {
    const resolved = SPELLING_ALIASES[cityName.toLowerCase()] || cityName;
    onChange(resolved);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full sm:w-52", className)}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 cursor-pointer transition-all duration-200 hover:border-zinc-300",
          isOpen && "border-zinc-400 shadow-sm",
        )}
      >
        <MapPin className="h-4 w-4 shrink-0 text-red-600" />
        <span
          className={cn(
            "flex-1 text-sm font-medium truncate select-none",
            value ? "text-zinc-900 font-semibold" : "text-zinc-400",
          )}
        >
          {value || placeholder}
        </span>
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
              isOpen && "rotate-180 text-zinc-700",
            )}
          />
        )}
      </div>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-80 w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:w-64">
          {/* Inner Search Box */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 500+ Indian cities..."
              className="w-full bg-transparent text-zinc-900 placeholder-zinc-400 outline-none text-xs font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Popular City Chips */}
          {!search && (
            <div className="border-b border-zinc-100 p-2">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Popular Destinations
              </p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                      value.toLowerCase() === c.toLowerCase()
                        ? "bg-red-600 text-white font-semibold"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities List */}
          <div className="mt-1 flex-1 overflow-y-auto divide-y divide-zinc-50 py-1 scrollbar-thin">
            {filteredCities.length > 0 ? (
              filteredCities.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors rounded-lg",
                    value.toLowerCase() === name.toLowerCase()
                      ? "bg-red-50 font-bold text-red-600"
                      : "text-zinc-800 hover:bg-zinc-100/80 font-medium",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {name}
                  </span>
                  {count > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {count} spots
                    </span>
                  ) : value.toLowerCase() === name.toLowerCase() ? (
                    <Check className="h-3.5 w-3.5 text-red-600" />
                  ) : null}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs text-zinc-400">
                No cities matching &quot;{search}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
