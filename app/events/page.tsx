"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { ProfileFormData, initialProfileData } from "@/lib/types";

export default function EventsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);

      const saved = localStorage.getItem("mosaicProfile");
      if (saved) setProfile(JSON.parse(saved));

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      setEvents(eventsData ?? []);

      const { data: attended } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("user_id", user.id);

      setJoinedIds(new Set(attended?.map((a) => a.event_id) ?? []));
      setLoading(false);
    };

    init();
  }, []);

  const toggleJoin = async (eventId: string) => {
    if (!userId) return;

    setJoiningId(eventId);

    if (joinedIds.has(eventId)) {
      await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      setJoinedIds((prev) => {
        const s = new Set(prev);
        s.delete(eventId);
        return s;
      });
    } else {
      await supabase
        .from("event_attendees")
        .insert({ event_id: eventId, user_id: userId });

      setJoinedIds((prev) => new Set([...prev, eventId]));
    }

    setJoiningId(null);
  };

  const handleNavigate = (view: string) => router.push(`/${view}`);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fcf7ff_0%,#ffffff_45%,#f7faff_100%)] px-4 py-6 pb-28 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <TopBar
          profile={profile}
          onOpenProfile={() => router.push("/profile")}
          onLogout={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
        />

        <section className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-600">
            <Ticket className="h-4 w-4" />
            Events
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
            Society events
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Browse society events here and sign up for the ones you want to
            attend.
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-10 text-center text-sm text-slate-400 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            No events yet.
          </div>
        ) : (
          <div className="space-y-5">
            {events.map((event) => {
              const joined = joinedIds.has(event.id);

              return (
                <section
                  key={event.id}
                  className="rounded-[30px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)] md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-500">
                        {event.society}
                      </p>

                      <h3 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-900">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {joined && (
                      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Joined ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {event.date && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-fuchsia-500" />
                        {formatDate(event.date)}
                      </span>
                    )}

                    {event.location && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        {event.location}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                      <Users className="h-3.5 w-3.5 text-pink-500" />
                      Groups of {event.max_group_size}
                    </span>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => toggleJoin(event.id)}
                      disabled={joiningId === event.id}
                      className={`w-full rounded-full px-6 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        joined
                          ? "border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100"
                          : "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-[0_10px_24px_rgba(192,38,211,0.18)] hover:from-fuchsia-600 hover:to-purple-600"
                      }`}
                    >
                      {joiningId === event.id
                        ? "Updating..."
                        : joined
                        ? "Leave event"
                        : "Join event"}
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav currentView="events" onNavigate={handleNavigate} />
    </main>
  );
}