"use client";

import { useState } from "react";
import { Users, Search, Trash2 } from "lucide-react";

const MOCK_USERS = [
  {
    id: "u1",
    name: "Vikram Malhotra",
    email: "vikram@example.com",
    role: "User",
    reviewsCount: 14,
    joined: "Jan 2026",
  },
  {
    id: "u2",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    role: "Moderator",
    reviewsCount: 42,
    joined: "Dec 2025",
  },
  {
    id: "u3",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    role: "Admin",
    reviewsCount: 8,
    joined: "Nov 2025",
  },
  {
    id: "u4",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "User",
    reviewsCount: 5,
    joined: "Feb 2026",
  },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
          <Users className="h-7 w-7 text-red-600" /> User Accounts Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          View registered foodies, assign roles, and manage user permissions.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm max-w-md">
        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user name or email..."
          className="w-full text-sm text-zinc-900 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Reviews</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xs">
                    {u.name[0]}
                  </div>
                  {u.name}
                </td>
                <td className="px-6 py-4 text-zinc-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === "Admin"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : u.role === "Moderator"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-700">{u.reviewsCount}</td>
                <td className="px-6 py-4 text-zinc-500 text-xs">{u.joined}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
