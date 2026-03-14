"use client";

import { useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { ProfileFormData } from "@/lib/types";

export default function TopBar({
  profile,
  onOpenProfile,
  onLogout,
}: {
  profile: ProfileFormData;
  onOpenProfile: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-between rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mosaic</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Welcome back{profile.firstName ? `, ${profile.firstName}` : ""}
        </h1>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-400"
        >
          {profile.profilePicturePreview ? (
            <img
              src={profile.profilePicturePreview}
              alt="Profile avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-5 w-5" />
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {profile.firstName || "Your"} {profile.lastName || "Profile"}
            </p>
            <p className="text-xs text-slate-500">Account menu</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenProfile();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <User className="h-4 w-4" />
              View profile
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}