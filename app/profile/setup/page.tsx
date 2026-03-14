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

  // Load existing profile from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { data } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();

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
  }, []);

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
        profilePicturePreview: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  // Only first name required
  const formIsComplete = useMemo(() => Boolean(profile.firstName.trim()), [profile]);

  const handleSave = async () => {
    if (!formIsComplete) return;
    setSaving(true);
    setSaveError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

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

    if (error) { setSaveError(error.message); setSaving(false); return; }

    localStorage.setItem("mosaicProfile", JSON.stringify(profile));
    router.push("/home");
  };

  if (loadingProfile) {
    return <main className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4" /> Mosaic
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Create your profile</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Build your profile and answer a few questions so you can be matched with people attending the same uni society events.
          </p>
        </div>

        <SectionCard title="Profile picture" subtitle="Add a photo to personalise your profile." icon={Camera}>
          <div className="grid gap-6 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
            <div className="flex justify-center md:justify-start">
              {profile.profilePicturePreview ? (
                <img src={profile.profilePicturePreview} alt="Preview" className="h-28 w-28 rounded-full border border-slate-200 object-cover" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Upload profile picture</span>
              <input type="file" accept="image/*" onChange={(e) => handleProfilePictureChange(e.target.files?.[0] ?? null)}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Basic profile" subtitle="Tell people a bit about who you are. Only first name is required." icon={User}>
          <div className="grid gap-5 md:grid-cols-2">
            <input value={profile.firstName} onChange={(e) => handleFieldChange("firstName", e.target.value)} placeholder="First name *" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.lastName} onChange={(e) => handleFieldChange("lastName", e.target.value)} placeholder="Last name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.age} onChange={(e) => handleFieldChange("age", e.target.value)} placeholder="Age" type="number" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.pronouns} onChange={(e) => handleFieldChange("pronouns", e.target.value)} placeholder="Pronouns" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.degree} onChange={(e) => handleFieldChange("degree", e.target.value)} placeholder="Degree" className="md:col-span-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.yearOfStudy} onChange={(e) => handleFieldChange("yearOfStudy", e.target.value)} placeholder="Year of study" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <textarea value={profile.bio} onChange={(e) => handleFieldChange("bio", e.target.value)} rows={4} placeholder="Short bio" className="md:col-span-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          </div>
        </SectionCard>

        <SectionCard title="Interests" subtitle="Choose the things you are into." icon={Heart}>
          <div className="flex flex-wrap gap-3">
            {chipOptions.map((interest) => {
              const active = profile.interests.includes(interest);
              const iconMap: Record<string, React.ReactNode> = {
                Music: <Music className="h-4 w-4" />, Gaming: <Gamepad2 className="h-4 w-4" />,
                Reading: <BookOpen className="h-4 w-4" />, "Coffee runs": <Coffee className="h-4 w-4" />, Sport: <Users className="h-4 w-4" />,
              };
              return (
                <button key={interest} type="button" onClick={() => toggleArrayValue("interests", interest)}
                  className={classNames("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                    active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400")}>
                  {iconMap[interest] ?? <MessageCircle className="h-4 w-4" />}{interest}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Matching details" subtitle="Add a few more details for better recommendations." icon={Sparkles}>
          <div className="grid gap-5 md:grid-cols-2">
            <input value={profile.preferredEventVibe} onChange={(e) => handleFieldChange("preferredEventVibe", e.target.value)} placeholder="Preferred event vibe (e.g. chill, hype)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.conversationStyle} onChange={(e) => handleFieldChange("conversationStyle", e.target.value)} placeholder="Conversation style (e.g. deep talks)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <input value={profile.idealHangout} onChange={(e) => handleFieldChange("idealHangout", e.target.value)} placeholder="Ideal hangout (e.g. cafe, park)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Social energy: {profile.socialEnergy}/5</label>
              <input value={profile.socialEnergy} onChange={(e) => handleFieldChange("socialEnergy", Number(e.target.value) || 3)}
                type="range" min="1" max="5" step="1" className="w-full accent-slate-900" />
              <div className="flex justify-between text-xs text-slate-400"><span>Introvert</span><span>Extrovert</span></div>
            </div>
            <textarea value={profile.funFact} onChange={(e) => handleFieldChange("funFact", e.target.value)} rows={3} placeholder="Fun fact about yourself" className="md:col-span-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          </div>
        </SectionCard>

        <SectionCard title="Weekend style" subtitle="Pick the activities that sound most like your ideal weekend." icon={Coffee}>
          <div className="flex flex-wrap gap-3">
            {["Cafe hopping","Sport or gym","Gaming night","Movies or shows","Exploring new places","Staying in and recharging"].map((option) => {
              const active = profile.weekendStyle.includes(option);
              return <button key={option} type="button" onClick={() => toggleArrayValue("weekendStyle", option)}
                className={classNames("rounded-full border px-4 py-2 text-sm font-medium transition", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400")}>{option}</button>;
            })}
          </div>
        </SectionCard>

        <SectionCard title="Music taste" subtitle="Choose the music styles that fit you best." icon={Music}>
          <div className="flex flex-wrap gap-3">
            {["Pop","R&B","Hip-hop","Indie","Electronic","A bit of everything"].map((option) => {
              const active = profile.musicTaste.includes(option);
              return <button key={option} type="button" onClick={() => toggleArrayValue("musicTaste", option)}
                className={classNames("rounded-full border px-4 py-2 text-sm font-medium transition", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400")}>{option}</button>;
            })}
          </div>
        </SectionCard>

        <SectionCard title="Who are you hoping to meet?" subtitle="Choose the kinds of people and connections you are looking for." icon={Users}>
          <div className="flex flex-wrap gap-3">
            {["People in my degree","People outside my degree","People with similar interests","People with opposite energy","A small close-knit group","As many people as possible"].map((option) => {
              const active = profile.tryingToMeet.includes(option);
              return <button key={option} type="button" onClick={() => toggleArrayValue("tryingToMeet", option)}
                className={classNames("rounded-full border px-4 py-2 text-sm font-medium transition", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400")}>{option}</button>;
            })}
          </div>
        </SectionCard>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Save profile</h2>
              <p className="mt-1 text-sm text-slate-600">Only your first name is required. You can always come back and update this.</p>
            </div>
            <button type="button" onClick={handleSave} disabled={!formIsComplete || saving}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
          {!formIsComplete && <p className="mt-4 text-sm text-amber-600">Please enter at least your first name.</p>}
          {saveError && <p className="mt-4 text-sm text-red-500">{saveError}</p>}
        </div>

      </div>
    </main>
  );
}
