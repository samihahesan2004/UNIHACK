"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { DBProfile, Event } from "@/lib/types";
import { Users, User, Send, X, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { initialProfileData, ProfileFormData } from "@/lib/types";
import Link from "next/link";

interface Message {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender?: DBProfile;
}

interface GroupWithEvent {
  groupId: string;
  event: Event;
  members: DBProfile[];
}

export default function GroupsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileFormData>(initialProfileData);

  // Chat state
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadGroups = useCallback(async (uid: string) => {
    const { data: memberships } = await supabase
      .from("match_group_members").select("group_id").eq("user_id", uid);

    if (!memberships || memberships.length === 0) { setGroups([]); return; }

    const groupIds = memberships.map((m) => m.group_id);
    const { data: matchGroups } = await supabase
      .from("match_groups").select("id, event_id").in("id", groupIds);

    if (!matchGroups) { setGroups([]); return; }

    const result: GroupWithEvent[] = [];
    for (const mg of matchGroups) {
      const { data: event } = await supabase.from("events").select("*").eq("id", mg.event_id).single();
      const { data: memberRows } = await supabase.from("match_group_members").select("user_id").eq("group_id", mg.id);
      const memberIds = memberRows?.map((m) => m.user_id) ?? [];
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", memberIds);
      if (event) result.push({ groupId: mg.id, event, members: (profiles as DBProfile[]) ?? [] });
    }
    setGroups(result);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile((prev) => ({
          ...prev,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          interests: data.interests ?? [],
        }));
      }

      await loadGroups(user.id);
      setLoading(false);
    };
    init();
  }, []);

  // Load messages when chat opens
  useEffect(() => {
    if (!openGroupId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("group_id", openGroupId)
        .order("created_at", { ascending: true });

      if (!data) return;

      // Enrich with sender profiles
      const enriched = await Promise.all(
        data.map(async (msg) => {
          const group = groups.find((g) => g.groupId === openGroupId);
          const sender = group?.members.find((m) => m.id === msg.user_id);
          return { ...msg, sender };
        })
      );
      setMessages(enriched);
    };

    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`group-chat-${openGroupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `group_id=eq.${openGroupId}`,
      }, async (payload) => {
        const msg = payload.new as Message;
        const group = groups.find((g) => g.groupId === openGroupId);
        const sender = group?.members.find((m) => m.id === msg.user_id);
        setMessages((prev) => [...prev, { ...msg, sender }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [openGroupId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !openGroupId || !userId) return;
    setSending(true);
    await supabase.from("messages").insert({
      group_id: openGroupId,
      user_id: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const openGroup = groups.find((g) => g.groupId === openGroupId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7e8fb] via-[#f8efff] to-[#edf4ff] px-4 py-6 pb-28 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <TopBar
          profile={profile}
          onOpenProfile={() => router.push("/profile")}
          onLogout={async () => { await supabase.auth.signOut(); router.push("/"); }}
        />

        <section className="rounded-[32px] border border-white/70 bg-white/65 p-6 shadow-[0_12px_40px_rgba(91,33,182,0.08)] backdrop-blur-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-white px-3 py-1 text-xs font-semibold text-fuchsia-600">
            <Users className="h-3 w-3" /> Groups
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Your groups</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            View the event groups you have been placed into and chat with your group.
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="space-y-3 rounded-[32px] border border-white/70 bg-white/65 py-16 text-center shadow-[0_12px_40px_rgba(91,33,182,0.08)] backdrop-blur-sm">
            <Users className="mx-auto h-10 w-10 text-fuchsia-200" />
            <p className="text-sm text-slate-500">No groups yet.</p>
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(217,70,239,0.25)] transition hover:opacity-90"
            >
              Browse events
            </button>
          </div>
        ) : (
          groups.map(({ groupId, event, members }) => (
            <div
              key={groupId}
              className="space-y-4 rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_12px_40px_rgba(91,33,182,0.08)] backdrop-blur-sm"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-500">
                  {event.society} · {event.title}
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-[#111827]">
                  <Users className="h-4 w-4 text-fuchsia-500" /> Your group · {members.length} people
                </h3>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-[#f1e7fb] bg-white/80 p-3 transition hover:bg-[#fcf8ff]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6ebff] text-fuchsia-600">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111827]">
                        {member.first_name} {member.last_name}
                        {member.id === userId && (
                          <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                        )}
                      </p>

                      {(member.degree || member.year_of_study) && (
                        <p className="truncate text-xs text-slate-500">
                          {member.degree}
                          {member.year_of_study ? ` · Year ${member.year_of_study}` : ""}
                        </p>
                      )}

                      {member.interests.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.interests.slice(0, 3).map((i, index) => {
                            const chipStyles = [
                              "bg-[#f6e8ff] text-fuchsia-600",
                              "bg-[#e8f7ee] text-emerald-600",
                              "bg-[#eaf1ff] text-blue-600",
                            ];
                            return (
                              <span
                                key={i}
                                className={`rounded-full px-2 py-0.5 text-xs ${chipStyles[index % chipStyles.length]}`}
                              >
                                {i}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { setOpenGroupId(groupId); setMessages([]); }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Open group chat
              </button>
            </div>
          ))
        )}
      </div>

      {openGroupId && openGroup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setOpenGroupId(null)}
          />
          <div
            className="relative flex h-[70vh] w-full max-w-lg flex-col rounded-[32px] border border-white/70 bg-[linear-gradient(to_bottom,#ffffff,#fbf7ff)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#f1e7fb] p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-fuchsia-500">
                  {openGroup.event.society} · {openGroup.event.title}
                </p>
                <h3 className="text-sm font-semibold text-[#111827]">
                  Group chat · {openGroup.members.length} people
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenGroupId(null)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-[#f8f1ff]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No messages yet. Say hi! 👋
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.user_id === userId;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f6ebff] text-fuchsia-600">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className={`flex max-w-[70%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <p className="px-1 text-xs text-slate-400">
                            {msg.sender?.first_name ?? "Unknown"}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm ${
                            isMe
                              ? "rounded-tr-sm bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white"
                              : "rounded-tl-sm border border-[#f1e7fb] bg-white text-[#111827]"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 border-t border-[#f1e7fb] p-4">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-[#eadcf8] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none placeholder:text-slate-400 focus:border-fuchsia-300"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="rounded-full bg-[#0f172a] p-2.5 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView="groups" onNavigate={(v) => router.push(`/${v}`)} />
    </main>
  );
}