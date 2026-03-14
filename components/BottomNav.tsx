"use client";

import { Home, Sparkles, Ticket, Users } from "lucide-react";
import { AppView } from "@/lib/types";
import { classNames } from "@/lib/utils";

export default function BottomNav({
  currentView,
  onNavigate,
}: {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}) {
  const items = [
    { label: "Home", value: "home" as AppView, icon: Home },
    { label: "Events", value: "events" as AppView, icon: Ticket },
    { label: "Matches", value: "matches" as AppView, icon: Sparkles },
    { label: "Groups", value: "groups" as AppView, icon: Users },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onNavigate(item.value)}
              className={classNames(
                "flex flex-col items-center justify-center rounded-full px-3 py-3 text-xs font-medium transition",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}