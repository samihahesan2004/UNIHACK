"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { initialProfileData, ProfileFormData } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);

  useEffect(() => {
    const savedProfile = localStorage.getItem("mosaicProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-20 md:px-6 md:py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile/setup")}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Edit profile
          </button>
        </div>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-center text-center">
            {profile.profilePicturePreview ? (
              <img
                src={profile.profilePicturePreview}
                alt="Profile"
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <User className="h-8 w-8" />
              </div>
            )}

            <h1 className="mt-4 text-3xl font-semibold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{profile.bio}</p>
          </div>
        </section>
      </div>
    </main>
  );
}