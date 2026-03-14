"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Users } from "lucide-react";
import { initialProfileData, ProfileFormData } from "@/lib/types";

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);
  const [signedUpCount, setSignedUpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      // Always load from Supabase (not localStorage) so switching accounts works
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data) {
        // No profile yet — go set one up
        router.push("/profile/setup");
        return;
      }

      // Map DB fields to form shape for TopBar compatibility
      const mapped: ProfileFormData = {
        ...initialProfileData,
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        bio: data.bio ?? "",
        degree: data.degree ?? "",
        yearOfStudy: data.year_of_study ?? "",
        pronouns: data.pronouns ?? "",
        interests: data.interests ?? [],
        weekendStyle: data.weekend_style ?? [],
        musicTaste: data.music_taste ?? [],
        tryingToMeet: data.trying_to_meet ?? [],
        preferredEventVibe: data.preferred_event_vibe ?? "",
        conversationStyle: data.conversation_style ?? "",
        idealHangout: data.ideal_hangout ?? "",
        funFact: data.fun_fact ?? "",
        socialEnergy: data.social_energy ?? 3,
      };
      setProfile(mapped);

      // Count events
      const { count } = await supabase
        .from("event_attendees")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setSignedUpCount(count ?? 0);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-28 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <TopBar
          profile={profile}
          onOpenProfile={() => router.push("/profile")}
          onLogout={handleLogout}
        />

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4" /> Discover your event circle
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Ready for your next society event?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Sign up for an event, get matched with 2 to 3 people who share similar interests, and join a small group created for that event.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/events")}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Browse events
            </button>
            <button type="button" onClick={() => router.push("/matches")}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
              View matches
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
            <button type="button" onClick={() => router.push("/events")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 flex items-center gap-2">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-900">Your groups</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">See who you've been matched with at events.</p>
            </div>
            <button type="button" onClick={() => router.push("/matches")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 flex items-center gap-2">
              View <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {profile.interests.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold text-slate-900 mb-3">Your interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{i}</span>
              ))}
            </div>
          </section>
        )}
      </div>
      <BottomNav currentView="home" onNavigate={(v) => router.push(`/${v}`)} />
    </main>
  );
}
