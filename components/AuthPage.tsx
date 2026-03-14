import { AtSign, Lock, Sparkles } from "lucide-react";
import { AuthMode } from "@/lib/types";
import { classNames } from "@/lib/utils";

export default function AuthPage({
  authMode,
  setAuthMode,
  authUsername,
  setAuthUsername,
  authPassword,
  setAuthPassword,
  onLogin,
  onStartSignup,
}: {
  authMode: AuthMode;
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  authUsername: string;
  setAuthUsername: React.Dispatch<React.SetStateAction<string>>;
  authPassword: string;
  setAuthPassword: React.Dispatch<React.SetStateAction<string>>;
  onLogin: () => void;
  onStartSignup: () => void;
}) {
  const canSubmit = authUsername.trim() && authPassword.trim();

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
            Sign in to your account or create a new one to start joining university society events, getting matched, and being placed into event groups.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={classNames(
                "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition",
                authMode === "login" ? "bg-slate-900 text-white" : "text-slate-600"
              )}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={classNames(
                "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition",
                authMode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"
              )}
            >
              Sign up
            </button>
          </div>

          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <AtSign className="h-4 w-4" />
                Username
              </span>
              <input
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="h-4 w-4" />
                Password
              </span>
              <input
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
          </div>

          {authMode === "login" ? (
            <button
              type="button"
              onClick={onLogin}
              disabled={!canSubmit}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Log in
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartSignup}
              disabled={!canSubmit}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to create account
            </button>
          )}
        </div>
      </div>
    </main>
  );
}