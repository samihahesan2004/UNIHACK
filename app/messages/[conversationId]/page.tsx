"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { DBProfile } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Send, User } from "lucide-react";
import Link from "next/link";

interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: DBProfile;
}

interface ConversationMember {
  conversation_id: string;
  user_id: string;
}

export default function PrivateMessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<DBProfile | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);

      const { data: members, error: membersError } = await supabase
        .from("conversation_members")
        .select("*")
        .eq("conversation_id", conversationId);

      if (membersError || !members || members.length === 0) {
        router.push("/matches");
        return;
      }

      const typedMembers = members as ConversationMember[];

      const otherMember = typedMembers.find((m) => m.user_id !== user.id);

      if (!otherMember) {
        router.push("/matches");
        return;
      }

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherMember.user_id)
        .single();

      if (otherProfile) {
        setOtherUser(otherProfile as DBProfile);
      }

      const { data: messageRows } = await supabase
        .from("private_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messageRows) {
        const senderIds = [...new Set(messageRows.map((m) => m.sender_id))];

        const { data: senderProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", senderIds);

        const profileMap = new Map(
          ((senderProfiles as DBProfile[]) ?? []).map((profile) => [profile.id, profile])
        );

        const enrichedMessages = (messageRows as PrivateMessage[]).map((msg) => ({
          ...msg,
          sender: profileMap.get(msg.sender_id),
        }));

        setMessages(enrichedMessages);
      }

      setLoading(false);
    };

    init();
  }, [conversationId, router, supabase]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`private-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const msg = payload.new as PrivateMessage;

          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", msg.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...msg,
              sender: senderProfile ? (senderProfile as DBProfile) : undefined,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    setSending(true);

    await supabase.from("private_messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage.trim(),
    });

    setNewMessage("");
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 pb-24 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>

        <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 md:p-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Private chat
              </p>
              <h1 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MessageCircle className="h-4 w-4" />
                {otherUser
                  ? `${otherUser.first_name ?? ""} ${otherUser.last_name ?? ""}`.trim()
                  : "Conversation"}
              </h1>

              {otherUser?.username && (
                <p className="mt-1 text-sm text-slate-500">@{otherUser.username}</p>
              )}
            </div>
          </div>

          <div className="h-[65vh] overflow-y-auto p-4 md:p-5">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No messages yet. Say hi 👋
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <User className="h-3.5 w-3.5" />
                      </div>

                      <div
                        className={`flex max-w-[75%] flex-col gap-1 ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        {!isMe && (
                          <p className="px-1 text-xs text-slate-400">
                            {msg.sender?.first_name ?? "Unknown"}
                          </p>
                        )}

                        <div
                          className={`rounded-2xl px-3 py-2 text-sm ${
                            isMe
                              ? "rounded-tr-sm bg-slate-900 text-white"
                              : "rounded-tl-sm bg-slate-100 text-slate-900"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-slate-100 p-4 md:p-5">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="rounded-full bg-slate-900 p-2.5 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}