"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { DBProfile, Event } from "@/lib/types";
import { Sparkles, User, ArrowUpRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { initialProfileData, ProfileFormData } from "@/lib/types";
import Link from "next/link";

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

  const loadGroups = useCallback(
    async (uid: string) => {
      const { data: memberships } = await supabase
        .from("match_group_members")
        .select("group_id")
        .eq("user_id", uid);

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        return [];
      }

      const groupIds = memberships.map((m) => m.group_id);

      const { data: matchGroups } = await supabase
        .from("match_groups")
        .select("id, event_id")
        .in("id", groupIds);

      if (!matchGroups) {
        setGroups([]);
        return [];
      }

      const result: GroupWithEvent[] = [];

      for (const mg of matchGroups) {
        const { data: event } = await supabase
          .from("events")
          .select("*")
          .eq("id", mg.event_id)
          .single();

        const { data: memberRows } = await supabase
          .from("match_group_members")
          .select("user_id")
          .eq("group_id", mg.id);

        const memberIds = memberRows?.map((m) => m.user_id) ?? [];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", memberIds);

        if (event) {
          result.push({
            groupId: mg.id,
            event,
            members: (profiles as DBProfile[]) ?? [],
          });
        }
      }

      setGroups(result);
      return result;
    },
    [supabase]
  );

  const loadUnmatched = useCallback(
    async (uid: string, matchedGroups: GroupWithEvent[]) => {
      const { data: attended } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("user_id", uid);

      const eventIds = attended?.map((a) => a.event_id) ?? [];

      if (eventIds.length === 0) {
        setJoinedUnmatched([]);
        return;
      }

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      const matchedEventIds = new Set(matchedGroups.map((g) => g.event.id));

      setJoinedUnmatched(
        (eventsData ?? []).filter((e) => !matchedEventIds.has(e.id))
      );
    },
    [supabase]
  );

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
            <Sparkles className="h-4 w-4" />
            Matches
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
            Your matches
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            View your event-based matching results here.
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading...
          </div>
        ) : (
          <>
            {groups.map(({ groupId, event, members }) => {
              const matchedPeople = members.filter((member) => member.id !== userId);

              return (
                <section
                  key={groupId}
                  className="rounded-[30px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)] md:p-7"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-500">
                      {event.society} · {event.title}
                    </p>

                    <h3 className="mt-2 flex items-center gap-2 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-900">
                      <Sparkles className="h-5 w-5 text-fuchsia-500" />
                      People you matched with
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Tap a profile to see why you matched.
                    </p>
                  </div>

                  {matchedPeople.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm text-slate-400">
                      No other matches in this group yet.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {matchedPeople.map((member) => (
                        <Link
                          key={member.id}
                          href={`/profile/${member.id}`}
                          className="group flex items-start gap-4 rounded-[22px] border border-slate-200/70 bg-white px-4 py-4 transition hover:border-fuchsia-200 hover:bg-fuchsia-50/40"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-100 to-indigo-100 text-slate-700">
                            <User className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {member.first_name} {member.last_name}
                                </p>

                                {member.degree && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {member.degree}
                                    {member.year_of_study
                                      ? ` · Year ${member.year_of_study}`
                                      : ""}
                                  </p>
                                )}
                              </div>

                              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-fuchsia-500" />
                            </div>

                            {member.interests.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {member.interests.slice(0, 3).map((i) => (
                                  <span
                                    key={i}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                                  >
                                    {i}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {joinedUnmatched.map((event) => (
              <section
                key={event.id}
                className="rounded-[30px] border border-dashed border-fuchsia-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-500">
                  {event.society} · {event.title}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  You&apos;ve joined this event but haven&apos;t been matched yet.
                </p>

                <button
                  type="button"
                  onClick={() => handleGenerateMatches(event.id)}
                  disabled={generating === event.id}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(192,38,211,0.18)] transition hover:from-fuchsia-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating === event.id
                    ? "Generating matches..."
                    : "✨ Generate matches now"}
                </button>
              </section>
            ))}

            {groups.length === 0 && joinedUnmatched.length === 0 && (
              <div className="rounded-[28px] border border-slate-200/70 bg-white/90 px-6 py-14 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">
                  No matches yet. Join an event first!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav currentView="matches" onNavigate={handleNavigate} />
    </main>
  );
}