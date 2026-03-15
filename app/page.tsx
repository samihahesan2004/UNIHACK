"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { classNames } from "@/lib/utils";

export default function Page() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-16 h-[28rem] w-[28rem] rounded-full bg-fuchsia-200/35 blur-[110px]" />
        <div className="absolute right-[-8rem] top-10 h-[24rem] w-[24rem] rounded-full bg-sky-100/80 blur-[110px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[18rem] w-[18rem] rounded-full bg-violet-100/70 blur-[100px]" />
      </div>

      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-[2.15rem] font-semibold tracking-[-0.06em] text-slate-950"
          >
            MOSAIC
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-fuchsia-200 bg-white/80 px-4 py-2 text-sm font-semibold text-fuchsia-700 shadow-sm backdrop-blur">
              Find friends for society events
            </div>

            <h1 className="mt-7 max-w-[11ch] text-6xl font-semibold leading-[0.95] tracking-[-0.07em] text-slate-950 md:text-7xl">
              Find your people before the event starts
            </h1>

            <p className="mt-8 max-w-xl text-[1.05rem] leading-8 text-slate-600">
              Mosaic helps students connect with others attending the same
              society events, so no one has to show up alone.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => router.push("/auth?mode=login")}
                className="rounded-full bg-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(192,38,211,0.28)] transition hover:bg-fuchsia-700"
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => router.push("/auth?mode=signup")}
                className="rounded-full border border-slate-200 bg-white/85 px-8 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white"
              >
                Sign up
              </button>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                <CalendarDays className="h-5 w-5 text-fuchsia-600" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Browse events
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Explore society events happening around campus.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                <Users className="h-5 w-5 text-fuchsia-600" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Get matched
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Find people with similar interests and social energy.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                <Sparkles className="h-5 w-5 text-fuchsia-600" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Go together
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Make the event feel less intimidating before you even arrive.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2.2rem] bg-white/45 p-6 shadow-[0_24px_80px_rgba(167,139,250,0.12)] backdrop-blur-sm">
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-fuchsia-600">
                      Featured event
                    </p>
                    <h2 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-slate-950">
                      UNSW Board Games Night
                    </h2>
                  </div>

                  <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-700">
                    12 going
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Thursday, 6:30 PM
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    Roundhouse, UNSW
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    Casual · Beginner friendly
                  </div>
                </div>

                <div className="mt-6 rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-base font-semibold text-slate-900">
                    Your possible group
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        name: "Aisha",
                        sub: "Loves chill events · 2 mutual interests",
                        tag: "Good match",
                        tagClass: "bg-emerald-100 text-emerald-700",
                      },
                      {
                        name: "Daniel",
                        sub: "First-year eng · wants people to go with",
                        tag: "Similar vibe",
                        tagClass: "bg-fuchsia-100 text-fuchsia-700",
                      },
                      {
                        name: "Mina",
                        sub: "Into games + anime · low social pressure",
                        tag: "New friend?",
                        tagClass: "bg-blue-100 text-blue-700",
                      },
                    ].map((person) => (
                      <div
                        key={person.name}
                        className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4"
                      >
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            {person.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {person.sub}
                          </p>
                        </div>
                        <span
                          className={classNames(
                            "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold",
                            person.tagClass
                          )}
                        >
                          {person.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/auth?mode=signup")}
                  className="mt-6 w-full rounded-[1.2rem] bg-slate-950 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-900"
                >
                  View matches
                </button>
              </div>
            </div>

            <div className="absolute -left-14 -top-10 hidden rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:block">
  <p className="text-sm font-semibold text-slate-400">Social vibe</p>
  <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-900">
    Chill + friendly
  </p>
</div>


            <div className="absolute -right-5 -bottom-6 hidden rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:block">
              <p className="text-sm font-semibold text-slate-400">Best part</p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                No awkward solo arrival
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
