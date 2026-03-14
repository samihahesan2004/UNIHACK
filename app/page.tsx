"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AtSign, Lock, Sparkles } from "lucide-react";
import { classNames } from "@/lib/utils";
import { AuthMode } from "@/lib/types";

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim() && password.trim();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/home");
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/profile/setup");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4" />
            Mosaic
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Meet people before the event starts
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Sign in to your account or create a new one to start joining university society events,
            getting matched, and being placed into event groups.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            {(["login", "signup"] as AuthMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setAuthMode(mode); setError(""); }}
                className={classNames(
                  "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition",
                  authMode === mode ? "bg-slate-900 text-white" : "text-slate-600"
                )}
              >
                {mode === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <AtSign className="h-4 w-4" /> Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@uni.edu.au"
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="h-4 w-4" /> Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            type="button"
            onClick={authMode === "login" ? handleLogin : handleSignup}
            disabled={!canSubmit || loading}
            className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : authMode === "login" ? "Log in" : "Continue to create account"}
          </button>
        </div>
      </div>
    </main>
  );
}
