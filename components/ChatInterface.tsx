"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  sending: boolean;
  disabled?: boolean;
  disabledReason?: string;
  pendingAssistant?: string;
};

function detectsTipp(text: string): { main: string; tipp: string | null } {
  const re = /\(Tipp[:：][\s\S]*?\)\s*$/;
  const match = text.match(re);
  if (!match) return { main: text.trim(), tipp: null };
  return {
    main: text.replace(re, "").trim(),
    tipp: match[0].replace(/^[\(\s]+|[\)\s]+$/g, "").trim(),
  };
}

function Bubble({ msg, streaming = false }: { msg: ChatMessage; streaming?: boolean }) {
  const isUser = msg.role === "user";
  const { main, tipp } = !isUser ? detectsTipp(msg.content) : { main: msg.content, tipp: null };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed md:max-w-[75%] md:text-base",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted",
        )}
      >
        <p className="whitespace-pre-wrap">{main}{streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />}</p>
        {tipp && (
          <div className="mt-2 flex gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs text-foreground">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <span>{tipp}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ChatInterface({
  messages,
  onSend,
  sending,
  disabled,
  disabledReason,
  pendingAssistant,
}: Props) {
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingAssistant]);

  async function submit() {
    const text = input.trim();
    if (!text || sending || disabled) return;
    setInput("");
    await onSend(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6"
        style={{ minHeight: "55vh", maxHeight: "55vh" }}
      >
        {messages.length === 0 && !pendingAssistant && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Sparkles className="mb-2 h-5 w-5 text-primary" />
            <p>Send a message to start the conversation.</p>
            <p className="mt-1 text-xs">
              Schreib einfach &ldquo;Hallo!&rdquo; und schau, was passiert.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {pendingAssistant !== undefined && (
          <Bubble
            msg={{ role: "assistant", content: pendingAssistant || "…" }}
            streaming
          />
        )}
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? (disabledReason ?? "Chat unavailable")
                : "Schreib auf Deutsch… (Enter to send, Shift+Enter for newline)"
            }
            rows={2}
            disabled={disabled || sending}
            className="resize-none text-base leading-relaxed"
          />
          <Button
            onClick={submit}
            disabled={disabled || sending || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {disabled && disabledReason && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
}
