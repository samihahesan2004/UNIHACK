"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { DBProfile, Event } from "@/lib/types";
import { Sparkles, Users, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { initialProfileData, ProfileFormData } from "@/lib/types";

interface GroupWithEvent {
  groupId: string;
  event: Event;
  members: DBProfile[];
}

export default function MatchesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithEvent[]>([]);
  const [joinedUnmatched, setJoinedUnmatched] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);

  const loadGroups = useCallback(async (uid: string) => {
    const { data: memberships } = await supabase
      .from("match_group_members").select("group_id").eq("user_id", uid);

    if (!memberships || memberships.length === 0) { setGroups([]); return []; }

    const groupIds = memberships.map((m) => m.group_id);
    const { data: matchGroups } = await supabase
      .from("match_groups").select("id, event_id").in("id", groupIds);

    if (!matchGroups) { setGroups([]); return []; }

    const result: GroupWithEvent[] = [];
    for (const mg of matchGroups) {
      const { data: event } = await supabase.from("events").select("*").eq("id", mg.event_id).single();
      const { data: memberRows } = await supabase.from("match_group_members").select("user_id").eq("group_id", mg.id);
      const memberIds = memberRows?.map((m) => m.user_id) ?? [];
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", memberIds);
      if (event) result.push({ groupId: mg.id, event, members: (profiles as DBProfile[]) ?? [] });
    }

    setGroups(result);
    return result;
  }, [supabase]);

  const loadUnmatched = useCallback(async (uid: string, matchedGroups: GroupWithEvent[]) => {
    const { data: attended } = await supabase
      .from("event_attendees").select("event_id").eq("user_id", uid);
    const eventIds = attended?.map((a) => a.event_id) ?? [];
    if (eventIds.length === 0) { setJoinedUnmatched([]); return; }

    const { data: eventsData } = await supabase.from("events").select("*").in("id", eventIds);
    const matchedEventIds = new Set(matchedGroups.map((g) => g.event.id));
    setJoinedUnmatched((eventsData ?? []).filter((e) => !matchedEventIds.has(e.id)));
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const saved = localStorage.getItem("mosaicProfile");
      if (saved) setProfile(JSON.parse(saved));

      const g = await loadGroups(user.id);
      await loadUnmatched(user.id, g);
      setLoading(false);
    };
    init();
  }, []);

  const handleGenerateMatches = async (eventId: string) => {
    setGenerating(eventId);
    await fetch(`/api/events/${eventId}/generate-matches`, { method: "POST" });
    if (userId) {
      const g = await loadGroups(userId);
      await loadUnmatched(userId, g);
    }
    setGenerating(null);
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
            <Sparkles className="h-4 w-4" /> Matches
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Your matches</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">View your event-based matching results here.</p>
        </section>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
        ) : (
          <>
            {groups.map(({ groupId, event, members }) => (
              <div key={groupId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{event.society} · {event.title}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Your group
                  </h3>
                </div>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {member.first_name} {member.last_name}
                          {member.id === userId && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                        </p>
                        {member.degree && <p className="text-xs text-slate-500">{member.degree} · Year {member.year_of_study}</p>}
                        {member.interests.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {member.interests.slice(0, 3).map((i) => (
                              <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{i}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {joinedUnmatched.map((event) => (
              <div key={event.id} className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{event.society} · {event.title}</p>
                <p className="text-sm text-slate-500">You've joined this event but haven't been matched yet.</p>
                <button type="button" onClick={() => handleGenerateMatches(event.id)} disabled={generating === event.id}
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {generating === event.id ? "Generating matches..." : "✨ Generate matches now"}
                </button>
              </div>
            ))}

            {groups.length === 0 && joinedUnmatched.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-30" />
                <p>No matches yet. Join an event first!</p>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav currentView="matches" onNavigate={handleNavigate} />
    </main>
  );
}
