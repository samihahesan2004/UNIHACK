"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Coffee,
  Gamepad2,
  Heart,
  MessageCircle,
  Music,
  Sparkles,
  User,
  Users,
  BookOpen,
} from "lucide-react";
import SectionCard from "@/components/SectionCard";
import { chipOptions, initialProfileData, ProfileFormData } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile((prev) => ({
          ...prev,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          age: data.age ? String(data.age) : "",
          pronouns: data.pronouns ?? "",
          bio: data.bio ?? "",
          degree: data.degree ?? "",
          yearOfStudy: data.year_of_study ?? "",
          interests: data.interests ?? [],
          weekendStyle: data.weekend_style ?? [],
          musicTaste: data.music_taste ?? [],
          tryingToMeet: data.trying_to_meet ?? [],
          preferredEventVibe: data.preferred_event_vibe ?? "",
          conversationStyle: data.conversation_style ?? "",
          idealHangout: data.ideal_hangout ?? "",
          funFact: data.fun_fact ?? "",
          socialEnergy: data.social_energy ?? 3,
        }));
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleFieldChange = (
    field: keyof ProfileFormData,
    value: string | number | string[] | File | null
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev) => {
      const current = prev[field] as string[];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return { ...prev, [field]: next };
    });
  };

  const handleProfilePictureChange = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        profilePictureFile: file,
        profilePicturePreview:
          typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const formIsComplete = useMemo(
    () => Boolean(profile.firstName.trim()),
    [profile]
  );

  const handleSave = async () => {
    if (!formIsComplete) return;

    setSaving(true);
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: user.email?.split("@")[0] ?? user.id,
      first_name: profile.firstName,
      last_name: profile.lastName,
      age: profile.age ? parseInt(profile.age) : null,
      pronouns: profile.pronouns,
      bio: profile.bio,
      degree: profile.degree,
      year_of_study: profile.yearOfStudy,
      interests: profile.interests,
      weekend_style: profile.weekendStyle,
      music_taste: profile.musicTaste,
      trying_to_meet: profile.tryingToMeet,
      preferred_event_vibe: profile.preferredEventVibe,
      conversation_style: profile.conversationStyle,
      ideal_hangout: profile.idealHangout,
      fun_fact: profile.funFact,
      social_energy: profile.socialEnergy,
    });

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    localStorage.setItem("mosaicProfile", JSON.stringify(profile));
    router.push("/home");
  };

  if (loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm backdrop-blur">
          Loading profile...
        </div>
      </main>
    );
  }

  const inputClassName =
    "w-full rounded-[1rem] border border-slate-200 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100";

  const chipClassName = (active: boolean) =>
    classNames(
      "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
      active
        ? "border-fuchsia-600 bg-fuchsia-600 text-white shadow-sm"
        : "border-slate-200 bg-white/90 text-slate-700 hover:border-fuchsia-200 hover:text-slate-900"
    );

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-16 h-[28rem] w-[28rem] rounded-full bg-fuchsia-200/35 blur-[110px]" />
        <div className="absolute right-[-8rem] top-10 h-[24rem] w-[24rem] rounded-full bg-sky-100/80 blur-[110px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[18rem] w-[18rem] rounded-full bg-violet-100/70 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2.2rem] border border-slate-200 bg-white/80 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700">
            <Sparkles className="h-4 w-4" />
            Mosaic
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
            Create your profile
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Set up your profile so Mosaic can match you with people who feel
            like your kind of crowd before the event even starts.
          </p>
        </div>

        <SectionCard
          title="Profile picture"
          subtitle="Add a photo so people can recognise you more easily."
          icon={Camera}
        >
          <div className="grid gap-6 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
            <div className="flex justify-center md:justify-start">
              {profile.profilePicturePreview ? (
                <img
                  src={profile.profilePicturePreview}
                  alt="Preview"
                  className="h-28 w-28 rounded-full border border-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Upload profile picture
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleProfilePictureChange(e.target.files?.[0] ?? null)
                }
                className="block w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Basic profile"
          subtitle="Tell people a little about who you are. Only your first name is required."
          icon={User}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <input
              value={profile.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              placeholder="First name *"
              className={inputClassName}
            />
            <input
              value={profile.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              placeholder="Last name"
              className={inputClassName}
            />
            <input
              value={profile.age}
              onChange={(e) => handleFieldChange("age", e.target.value)}
              placeholder="Age"
              type="number"
              className={inputClassName}
            />
            <input
              value={profile.pronouns}
              onChange={(e) => handleFieldChange("pronouns", e.target.value)}
              placeholder="Pronouns"
              className={inputClassName}
            />
            <input
              value={profile.degree}
              onChange={(e) => handleFieldChange("degree", e.target.value)}
              placeholder="Degree"
              className={classNames("md:col-span-2", inputClassName)}
            />
            <input
              value={profile.yearOfStudy}
              onChange={(e) =>
                handleFieldChange("yearOfStudy", e.target.value)
              }
              placeholder="Year of study"
              className={inputClassName}
            />
            <textarea
              value={profile.bio}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              rows={4}
              placeholder="Short bio"
              className={classNames(
                "md:col-span-2 resize-none",
                inputClassName
              )}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Interests"
          subtitle="Choose the things you are into."
          icon={Heart}
        >
          <div className="flex flex-wrap gap-3">
            {chipOptions.map((interest) => {
              const active = profile.interests.includes(interest);
              const iconMap: Record<string, React.ReactNode> = {
                Music: <Music className="h-4 w-4" />,
                Gaming: <Gamepad2 className="h-4 w-4" />,
                Reading: <BookOpen className="h-4 w-4" />,
                "Coffee runs": <Coffee className="h-4 w-4" />,
                Sport: <Users className="h-4 w-4" />,
              };

              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleArrayValue("interests", interest)}
                  className={chipClassName(active)}
                >
                  {iconMap[interest] ?? <MessageCircle className="h-4 w-4" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Matching details"
          subtitle="Add a few extra details so your matches feel more accurate."
          icon={Sparkles}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <input
              value={profile.preferredEventVibe}
              onChange={(e) =>
                handleFieldChange("preferredEventVibe", e.target.value)
              }
              placeholder="Preferred event vibe"
              className={inputClassName}
            />
            <input
              value={profile.conversationStyle}
              onChange={(e) =>
                handleFieldChange("conversationStyle", e.target.value)
              }
              placeholder="Conversation style"
              className={inputClassName}
            />
            <input
              value={profile.idealHangout}
              onChange={(e) => handleFieldChange("idealHangout", e.target.value)}
              placeholder="Ideal hangout"
              className={inputClassName}
            />

            <div className="rounded-[1rem] border border-slate-200 bg-white/90 px-4 py-4">
              <label className="text-sm font-medium text-slate-700">
                Social energy: {profile.socialEnergy}/5
              </label>
              <input
                value={profile.socialEnergy}
                onChange={(e) =>
                  handleFieldChange(
                    "socialEnergy",
                    Number(e.target.value) || 3
                  )
                }
                type="range"
                min="1"
                max="5"
                step="1"
                className="mt-3 w-full accent-fuchsia-600"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>More reserved</span>
                <span>More outgoing</span>
              </div>
            </div>

            <textarea
              value={profile.funFact}
              onChange={(e) => handleFieldChange("funFact", e.target.value)}
              rows={3}
              placeholder="Fun fact about yourself"
              className={classNames(
                "md:col-span-2 resize-none",
                inputClassName
              )}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Weekend style"
          subtitle="Pick the activities that sound most like your ideal weekend."
          icon={Coffee}
        >
          <div className="flex flex-wrap gap-3">
            {[
              "Cafe hopping",
              "Sport or gym",
              "Gaming night",
              "Movies or shows",
              "Exploring new places",
              "Staying in and recharging",
            ].map((option) => {
              const active = profile.weekendStyle.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleArrayValue("weekendStyle", option)}
                  className={chipClassName(active)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Music taste"
          subtitle="Choose the music styles that fit you best."
          icon={Music}
        >
          <div className="flex flex-wrap gap-3">
            {[
              "Pop",
              "R&B",
              "Hip-hop",
              "Indie",
              "Electronic",
              "A bit of everything",
            ].map((option) => {
              const active = profile.musicTaste.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleArrayValue("musicTaste", option)}
                  className={chipClassName(active)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Who are you hoping to meet?"
          subtitle="Choose the kinds of people and connections you are looking for."
          icon={Users}
        >
          <div className="flex flex-wrap gap-3">
            {[
              "People in my degree",
              "People outside my degree",
              "People with similar interests",
              "People with opposite energy",
              "A small close-knit group",
              "As many people as possible",
            ].map((option) => {
              const active = profile.tryingToMeet.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleArrayValue("tryingToMeet", option)}
                  className={chipClassName(active)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Save profile
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Your first name is the only required field. You can always come
                back and edit the rest later.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!formIsComplete || saving}
              className="rounded-full bg-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(192,38,211,0.22)] transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>

          {!formIsComplete && (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Please enter at least your first name.
            </p>
          )}

          {saveError && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">
              {saveError}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
