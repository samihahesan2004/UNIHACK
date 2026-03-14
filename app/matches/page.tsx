"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { AppView, initialProfileData, ProfileFormData } from "@/lib/types";

export default function MatchesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);

  useEffect(() => {
    const savedProfile = localStorage.getItem("mosaicProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleNavigate = (view: AppView) => {
    if (view === "home") router.push("/home");
    if (view === "events") router.push("/events");
    if (view === "matches") router.push("/matches");
    if (view === "groups") router.push("/groups");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-28 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <TopBar
          profile={profile}
          onOpenProfile={() => router.push("/profile")}
          onLogout={() => router.push("/")}
        />

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Your matches</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
            View your event-based matching results here, including individual recommendations and existing groups.
          </p>
        </section>
      </div>

      <BottomNav currentView="matches" onNavigate={handleNavigate} />
    </main>
  );
}