"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { AppView, initialProfileData, ProfileFormData } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);
  const signedUpCount: number = 0;

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
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4" />
            Discover your event circle
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Ready for your next society event?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Sign up for an event, get matched with 2 to 3 people who share similar interests, and
            join a small group created for that event.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse events
            </button>

            <button
              type="button"
              onClick={() => router.push("/groups")}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              View groups
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Event sign-ups</p>
              <p className="mt-1 text-sm text-slate-500">
                You are currently signed up for {signedUpCount} event{signedUpCount === 1 ? "" : "s"}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Manage events
            </button>
          </div>
        </section>
      </div>

      <BottomNav currentView="home" onNavigate={handleNavigate} />
    </main>
  );
}