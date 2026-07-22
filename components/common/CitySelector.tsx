"use client";

// components/common/CitySelector.tsx
// Premium, custom-styled City Dropdown Selector for Yelp India
// Replaces ugly native datalist/select with a sleek, searchable popover menu.

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
  "Mumbai",
  "New Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Goa",
];

export default function CitySelector({
  value,
  onChange,
  placeholder = "Select City...",
  className,
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (cityName: string) => {
    onChange(cityName);
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

      {/* Premium Floating Menu */}
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
              placeholder="Search 500+ cities..."
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
                      value === c
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
              filteredCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors rounded-lg",
                    value === c
                      ? "bg-red-50 font-bold text-red-600"
                      : "text-zinc-800 hover:bg-zinc-100/80 font-medium",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {c}
                  </span>
                  {value === c && <Check className="h-3.5 w-3.5 text-red-600" />}
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
