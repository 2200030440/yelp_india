"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Globe2,
  Building2,
  RotateCcw,
} from "lucide-react";
import { INDIAN_CITIES, INDIAN_STATES, CITY_COORDINATES } from "@/constants";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  provider?: string;
  city?: string | null;
  state?: string | null;
  reviewsCount: number;
  joined: string;
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      Google
    </span>
  );
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users?t=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load admin users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Fast polling every 3 seconds to update newly signed up / Google logged in users instantly
    const interval = setInterval(() => {
      fetch("/api/admin/users?t=" + Date.now(), { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.users) {
            setUsers(data.users);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      showToast(`User "${name}" removed successfully.`);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // Compute cities based on selected state
  const availableCities = useMemo(() => {
    if (selectedState === "all") {
      const userCities = users.map((u) => u.city).filter(Boolean) as string[];
      return Array.from(new Set([...userCities, ...INDIAN_CITIES])).sort();
    }
    const stateCities = Object.entries(CITY_COORDINATES)
      .filter(([_, data]) => data.state.toLowerCase() === selectedState.toLowerCase())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const userStateCities = users
      .filter((u) => u.state && u.state.toLowerCase() === selectedState.toLowerCase())
      .map((u) => u.city)
      .filter(Boolean) as string[];

    return Array.from(new Set([...stateCities, ...userStateCities])).sort();
  }, [selectedState, users]);

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity("all");
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const qLower = search.toLowerCase().trim();
      const matchesSearch =
        !qLower ||
        u.name.toLowerCase().includes(qLower) ||
        u.email.toLowerCase().includes(qLower) ||
        (u.city && u.city.toLowerCase().includes(qLower)) ||
        (u.state && u.state.toLowerCase().includes(qLower));

      const matchesRole =
        roleFilter === "all" ||
        u.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesState =
        selectedState === "all" ||
        (u.state && u.state.toLowerCase() === selectedState.toLowerCase()) ||
        (u.city && u.city.toLowerCase().includes(selectedState.toLowerCase()));

      const matchesCity =
        selectedCity === "all" ||
        (u.city && u.city.toLowerCase().includes(selectedCity.toLowerCase())) ||
        (u.city && selectedCity.toLowerCase().includes(u.city.toLowerCase()));

      return matchesSearch && matchesRole && matchesState && matchesCity;
    });
  }, [users, search, roleFilter, selectedState, selectedCity]);

  const resetFilters = () => {
    setSearch("");
    setSelectedState("all");
    setSelectedCity("all");
    setRoleFilter("all");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 tracking-tight">
            <Users className="h-7 w-7 text-red-600" /> User Accounts Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time live user sync. Filter foodies by State and City across India.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Users ({users.length})
        </button>
      </div>

      {/* Top Location Filter Bar: State & City Dropdowns */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* State Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700">
            <Globe2 className="h-4 w-4 text-red-600 shrink-0" />
            <span>State:</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="bg-transparent outline-none font-bold text-zinc-900 cursor-pointer"
            >
              <option value="all">All States across India</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700">
            <Building2 className="h-4 w-4 text-red-600 shrink-0" />
            <span>City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent outline-none font-bold text-zinc-900 cursor-pointer"
            >
              <option value="all">
                {selectedState !== "all" ? `All Cities in ${selectedState}` : "All Cities"}
              </option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 font-bold outline-none shadow-sm cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Foodies / Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Administrators</option>
          </select>

          {/* Search Input */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by foodie name or email..."
              className="w-full text-xs text-zinc-900 outline-none font-medium placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-zinc-600">
            <span className="font-semibold text-zinc-800">
              Showing <span className="text-red-600 font-extrabold">{filtered.length}</span> of{" "}
              {users.length} registered users
            </span>
            {selectedState !== "all" && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-bold text-red-700 border border-red-200">
                State: {selectedState}
              </span>
            )}
            {selectedCity !== "all" && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-bold text-orange-700 border border-orange-200">
                City: {selectedCity}
              </span>
            )}
          </div>

          {(selectedState !== "all" || selectedCity !== "all" || search || roleFilter !== "all") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-zinc-400">
            Loading user accounts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            No registered users found matching your State, City, or search criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">State & City</th>
                <th className="px-6 py-4">Auth Provider</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Reviews</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filtered.map((u) => (
                <tr key={u.id || u.email} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                    {u.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover border border-zinc-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 font-extrabold text-xs shadow-sm">
                        {u.name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <p className="leading-snug">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-lg">
                      📍 {u.city || "Guntur"}{u.state ? `, ${u.state}` : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.provider === "google" ? (
                      <GoogleBadge />
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                        Email & Password
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role.toLowerCase() === "admin"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : u.role.toLowerCase() === "moderator"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-800">{u.reviewsCount}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs font-medium">{u.joined}</td>
                  <td className="px-6 py-4 text-right">
                    {u.role.toLowerCase() === "admin" ? (
                      <span className="text-[11px] text-zinc-400 font-semibold flex items-center justify-end gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Protected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Remove user account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
