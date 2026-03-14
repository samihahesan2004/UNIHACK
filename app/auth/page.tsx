"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AtSign, Lock, Sparkles } from "lucide-react";
import { classNames } from "@/lib/utils";
import { AuthMode } from "@/lib/types";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "login";

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
    setAuthMode(mode);
  }, [searchParams]);

  const canSubmit = email.trim() && password.trim();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/home");
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/profile/setup");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
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

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2.2rem] border border-slate-200 bg-white/75 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700">
              <Sparkles className="h-4 w-4" />
              Mosaic
            </div>

            <h1 className="mt-6 max-w-[10ch] text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950 md:text-6xl">
              Meet people before the event starts
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Sign in to your account or create a new one to start joining
              university society events, getting matched, and being placed into
              event groups.
            </p>
          </div>

          <div className="rounded-[2.2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <div className="mb-6 flex rounded-full bg-slate-100 p-1">
              {(["login", "signup"] as AuthMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAuthMode(mode);
                    setError("");
                  }}
                  className={classNames(
                    "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition",
                    authMode === mode
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  )}
                >
                  {mode === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <AtSign className="h-4 w-4 text-fuchsia-600" />
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@uni.edu.au"
                  type="email"
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="h-4 w-4 text-fuchsia-600" />
                  Password
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  type="password"
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={authMode === "login" ? handleLogin : handleSignup}
              disabled={!canSubmit || loading}
              className="mt-5 w-full rounded-[1rem] bg-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Log in"
                : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
