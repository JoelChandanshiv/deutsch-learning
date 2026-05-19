"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelSelector } from "@/components/LevelSelector";
import { ChatInterface, type ChatMessage } from "@/components/ChatInterface";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, addXP, XP_REWARDS, type CEFRLevel } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";
import { DAILY_CHAT_LIMIT, getChatLimit, incrementChatLimit } from "@/lib/chatLimit";
import { LEVELS_WITH_CONTENT } from "@/lib/content";
import { cn } from "@/lib/utils";

const TOPICS = [
  { id: "free", label: "Free chat" },
  { id: "restaurant", label: "Order food" },
  { id: "interview", label: "Job interview" },
  { id: "day", label: "Tell your day" },
  { id: "doctor", label: "Visit the doctor" },
] as const;

type TopicId = (typeof TOPICS)[number]["id"];

function looksLikeGerman(text: string): boolean {
  // Heuristic: contains umlaut/ß, common German function word, or German-style capitalized noun count
  if (/[äöüÄÖÜß]/.test(text)) return true;
  if (/\b(ich|du|wir|ihr|sie|der|die|das|und|aber|nicht|ist|sind|war|bin|hat|haben|werde|werden|gehe|kann|möchte|heißt|heiße)\b/i.test(text)) return true;
  return false;
}

export default function ChatPage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const [topic, setTopic] = React.useState<TopicId>("free");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [pendingAssistant, setPendingAssistant] = React.useState<string | undefined>(undefined);
  const [sending, setSending] = React.useState(false);
  const limit = useStore(getChatLimit, { used: 0, remaining: DAILY_CHAT_LIMIT, date: "" });

  // Reset conversation when topic or level changes
  React.useEffect(() => {
    setMessages([]);
    setPendingAssistant(undefined);
  }, [topic, level]);

  async function handleSend(text: string) {
    if (limit.remaining <= 0) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setSending(true);
    setPendingAssistant("");

    // Award XP if user wrote German
    if (looksLikeGerman(text)) {
      addXP(XP_REWARDS.chatMessage);
      recordActivity();
    }
    incrementChatLimit();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level, topic, messages: nextMessages }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        setMessages([
          ...nextMessages,
          { role: "assistant", content: `(Es gab einen Fehler: ${errText || res.statusText})` },
        ]);
        setPendingAssistant(undefined);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setPendingAssistant(acc);
      }
      setMessages([...nextMessages, { role: "assistant", content: acc.trim() }]);
      setPendingAssistant(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessages([
        ...nextMessages,
        { role: "assistant", content: `(Verbindung gestört: ${msg})` },
      ]);
      setPendingAssistant(undefined);
    } finally {
      setSending(false);
    }
  }

  const exhausted = limit.remaining <= 0;

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <LevelSelector enabledLevels={LEVELS_WITH_CONTENT} />
      </div>

      <header className="mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <MessageCircle className="h-4 w-4" /> AI Conversation
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Speak with a German tutor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a scenario and start typing — in German if you can. You get a
          gentle correction when you slip up. ({limit.used}/{DAILY_CHAT_LIMIT}{" "}
          messages today)
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(t.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              topic === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ChatInterface
        messages={messages}
        onSend={handleSend}
        sending={sending}
        disabled={exhausted}
        disabledReason={
          exhausted
            ? "You've reached today's chat limit. Come back tomorrow to keep practicing!"
            : undefined
        }
        pendingAssistant={pendingAssistant}
      />

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Tip: each German message earns{" "}
        <Badge variant="secondary" className="px-1.5 py-0">
          +{XP_REWARDS.chatMessage} XP
        </Badge>
      </p>
    </div>
  );
}
