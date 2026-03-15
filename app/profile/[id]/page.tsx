import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { DBProfile } from "@/lib/types";
import { User, ArrowLeft } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const user = profile as DBProfile;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let currentUserProfile: DBProfile | null = null;

  if (authUser) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (currentProfile) {
      currentUserProfile = currentProfile as DBProfile;
    }
  }

  const isViewingOwnProfile =
    currentUserProfile && currentUserProfile.id === user.id;

  const matchReasons =
    currentUserProfile && !isViewingOwnProfile
      ? getMatchReasons(currentUserProfile, user)
      : [];

  const sharedInterests =
    currentUserProfile && !isViewingOwnProfile
      ? (currentUserProfile.interests ?? []).filter((interest) =>
          (user.interests ?? []).includes(interest)
        )
      : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-20 md:px-6 md:py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-9 w-9" />
            </div>

            <div className="min-w-0 flex-1">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {user.first_name ?? "Unknown"} {user.last_name ?? ""}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  {user.username && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      @{user.username}
                    </span>
                  )}

                  {user.age !== null && user.age !== undefined && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      Age {user.age}
                    </span>
                  )}

                  {user.pronouns && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {user.pronouns}
                    </span>
                  )}

                  {user.degree && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {user.degree}
                    </span>
                  )}

                  {user.year_of_study && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      Year {user.year_of_study}
                    </span>
                  )}
                </div>
              </div>

              {user.bio && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Bio
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {user.bio}
                  </p>
                </div>
              )}

              {user.fun_fact && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Fun fact
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {user.fun_fact}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {sharedInterests.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Shared interests
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {matchReasons.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Why you matched
            </div>

            <div className="mt-4 space-y-3">
              {matchReasons.map((reason) => (
                <div
                  key={reason}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {reason}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function getMatchReasons(currentUser: DBProfile, viewedUser: DBProfile) {
  const reasons: string[] = [];

  const sharedInterests = (currentUser.interests ?? []).filter((interest) =>
    (viewedUser.interests ?? []).includes(interest)
  );

  if (sharedInterests.length >= 2) {
    reasons.push(`You both like ${sharedInterests.slice(0, 2).join(" and ")}`);
  } else if (sharedInterests.length === 1) {
    reasons.push(`You both like ${sharedInterests[0]}`);
  }

  const sharedWeekendStyle = (currentUser.weekend_style ?? []).filter((item) =>
    (viewedUser.weekend_style ?? []).includes(item)
  );

  if (sharedWeekendStyle.length > 0) {
    reasons.push(
      `You both enjoy ${sharedWeekendStyle[0].toLowerCase()} on weekends`
    );
  }

  const sharedTryingToMeet = (currentUser.trying_to_meet ?? []).filter((item) =>
    (viewedUser.trying_to_meet ?? []).includes(item)
  );

  if (sharedTryingToMeet.length > 0) {
    reasons.push(
      `You’re both hoping to meet ${sharedTryingToMeet[0].toLowerCase()}`
    );
  }

  const sharedMusic = (currentUser.music_taste ?? []).filter((item) =>
    (viewedUser.music_taste ?? []).includes(item)
  );

  if (sharedMusic.length > 0) {
    reasons.push("You both have a similar music taste");
  }

  if (
    currentUser.preferred_event_vibe &&
    currentUser.preferred_event_vibe === viewedUser.preferred_event_vibe
  ) {
    reasons.push("You both prefer a similar kind of event vibe");
  }

  if (
    currentUser.conversation_style &&
    currentUser.conversation_style === viewedUser.conversation_style
  ) {
    reasons.push("You have a similar conversation style");
  }

  if (
    currentUser.ideal_hangout &&
    currentUser.ideal_hangout === viewedUser.ideal_hangout
  ) {
    reasons.push("You’d both probably enjoy the same kind of hangout");
  }

  if (
    currentUser.social_energy !== null &&
    currentUser.social_energy !== undefined &&
    viewedUser.social_energy !== null &&
    viewedUser.social_energy !== undefined &&
    Math.abs(currentUser.social_energy - viewedUser.social_energy) <= 1
  ) {
    reasons.push("Your social energy levels are pretty similar");
  }

  return reasons;
}
