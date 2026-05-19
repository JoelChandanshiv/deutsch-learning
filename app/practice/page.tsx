"use client";

import Link from "next/link";
import { ArrowRight, BookMarked, BookOpen, Brain, Headphones, MessageCircle, PencilLine, PenTool } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/useStore";
import { getDueCount, getAllCards } from "@/lib/srs";

const modes = [
  {
    href: "/practice/translate",
    icon: PencilLine,
    title: "Translation Drills",
    description: "Translate prompts both ways with instant AI grading.",
    cta: "Start drills",
  },
  {
    href: "/practice/read",
    icon: BookOpen,
    title: "Reading",
    description: "Real passages. Click any word for meaning.",
    cta: "Open library",
  },
  {
    href: "/practice/chat",
    icon: MessageCircle,
    title: "AI Conversation",
    description: "Chat in German at your level. Gentle corrections.",
    cta: "Start chatting",
  },
  {
    href: "/practice/listen",
    icon: Headphones,
    title: "Listening",
    description: "Train your ear. Type what you hear.",
    cta: "Start listening",
  },
  {
    href: "/practice/write",
    icon: PenTool,
    title: "Writing",
    description: "Write essays. Get detailed AI feedback.",
    cta: "Start writing",
  },
  {
    href: "/practice/vocab",
    icon: BookMarked,
    title: "Vocabulary",
    description: "Topic packs with the most-used words at your level.",
    cta: "Open packs",
  },
];

export default function PracticeIndex() {
  const due = useStore(getDueCount, 0);
  const total = useStore(() => getAllCards().length, 0);

  return (
    <div className="container py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Choose your practice mode
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pick whatever you have time for. Start with the daily review if cards
          are due.
        </p>
      </div>

      <Link href="/practice/review" className="mx-auto mt-12 block max-w-5xl group">
        <Card
          className={
            "border-2 transition-colors " +
            (due > 0
              ? "border-primary/60 bg-primary/5 group-hover:border-primary"
              : "border-border/60 group-hover:border-primary/40")
          }
        >
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 py-5">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-lg">
                  Daily Review
                  {due > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {due} due
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5 text-sm">
                  {due > 0
                    ? `${due} word${due === 1 ? "" : "s"} ready to review.`
                    : total === 0
                      ? "Add words from any reading to start building your queue."
                      : `All caught up — ${total} card${total === 1 ? "" : "s"} scheduled for later.`}
                </CardDescription>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardHeader>
        </Card>
      </Link>

      <div className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modes.map((m) => (
          <Link key={m.href} href={m.href} className="group">
            <Card className="h-full border-border/60 transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-xl">{m.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {m.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {m.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
