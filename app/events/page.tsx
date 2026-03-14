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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const saved = localStorage.getItem("mosaicProfile");
      if (saved) setProfile(JSON.parse(saved));

      const { data: eventsData } = await supabase
        .from("events").select("*").order("date", { ascending: true });
      setEvents(eventsData ?? []);

      const { data: attended } = await supabase
        .from("event_attendees").select("event_id").eq("user_id", user.id);
      setJoinedIds(new Set(attended?.map((a) => a.event_id) ?? []));

      setLoading(false);
    };
    init();
  }, []);

  const toggleJoin = async (eventId: string) => {
    if (!userId) return;
    setJoiningId(eventId);
    if (joinedIds.has(eventId)) {
      await supabase.from("event_attendees").delete()
        .eq("event_id", eventId).eq("user_id", userId);
      setJoinedIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
    } else {
      await supabase.from("event_attendees").insert({ event_id: eventId, user_id: userId });
      setJoinedIds((prev) => new Set([...prev, eventId]));
    }
    setJoiningId(null);
  };

  const handleNavigate = (view: string) => router.push(`/${view}`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-28 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <TopBar
          profile={profile}
          onOpenProfile={() => router.push("/profile")}
          onLogout={async () => { await supabase.auth.signOut(); router.push("/"); }}
        />

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Ticket className="h-4 w-4" /> Events
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Society events</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Browse society events here and sign up for the ones you want to attend.</p>
        </section>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No events yet.</div>
        ) : (
          events.map((event) => {
            const joined = joinedIds.has(event.id);
            return (
              <div key={event.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{event.society}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{event.title}</h3>
                    {event.description && <p className="mt-1 text-sm text-slate-600">{event.description}</p>}
                  </div>
                  {joined && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">Joined ✓</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  {event.date && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>}
                  {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>}
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Groups of {event.max_group_size}</span>
                </div>
                <button type="button" onClick={() => toggleJoin(event.id)} disabled={joiningId === event.id}
                  className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${joined ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:opacity-90"} disabled:opacity-50`}>
                  {joiningId === event.id ? "..." : joined ? "Leave event" : "Join event"}
                </button>
              </div>
            );
          })
        )}
      </div>
      <BottomNav currentView="events" onNavigate={handleNavigate} />
    </main>
  );
}
