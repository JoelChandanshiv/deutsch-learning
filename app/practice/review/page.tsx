"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Eye, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/AudioButton";
import { useStore } from "@/lib/useStore";
import { getDueCards, getStats, recordReview, type ReviewCard, type ReviewQuality } from "@/lib/srs";
import { addXP, XP_REWARDS } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";

const QUALITY_BUTTONS: {
  label: string;
  value: ReviewQuality;
  hint: string;
  variant: "destructive" | "outline" | "default" | "secondary";
}[] = [
  { label: "Again", value: 0, hint: "<1m", variant: "destructive" },
  { label: "Hard", value: 3, hint: "~6m", variant: "outline" },
  { label: "Good", value: 4, hint: "1d", variant: "default" },
  { label: "Easy", value: 5, hint: "4d+", variant: "secondary" },
];

export default function ReviewPage() {
  const [queue, setQueue] = React.useState<ReviewCard[]>([]);
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [sessionStats, setSessionStats] = React.useState({
    reviewed: 0,
    correct: 0,
    again: 0,
  });
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const stats = useStore(getStats, {
    total: 0,
    dueToday: 0,
    reviewedToday: 0,
    reviewedLast7Days: 0,
    retentionLast7Days: 0,
    averageInterval: 0,
    dueInNext7Days: [],
  });

  React.useEffect(() => {
    setQueue(getDueCards());
    setBootstrapped(true);
  }, []);

  const current = queue[index];
  const total = queue.length;
  const remaining = Math.max(0, total - index);
  const done = bootstrapped && total > 0 && index >= total;

  function rate(quality: ReviewQuality) {
    if (!current) return;
    recordReview(current.id, quality);
    setSessionStats((s) => ({
      reviewed: s.reviewed + 1,
      correct: s.correct + (quality >= 4 ? 1 : 0),
      again: s.again + (quality === 0 ? 1 : 0),
    }));
    if (quality >= 4) {
      addXP(XP_REWARDS.correctTranslation / 2 | 0 || 5);
      recordActivity();
    } else if (quality === 3) {
      addXP(2);
      recordActivity();
    }
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (done || !current) return;
    if (!revealed) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      }
      return;
    }
    if (e.key === "1") rate(0);
    if (e.key === "2") rate(3);
    if (e.key === "3" || e.key === "Enter" || e.key === " ") rate(4);
    if (e.key === "4") rate(5);
  }

  function startOver() {
    setQueue(getDueCards());
    setIndex(0);
    setRevealed(false);
    setSessionStats({ reviewed: 0, correct: 0, again: 0 });
  }

  return (
    <div
      className="container max-w-2xl py-10"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Brain className="mr-1 h-3 w-3" /> Spaced repetition
        </Badge>
      </div>

      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Daily Review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reviewing builds long-term memory. Be honest with your ratings — the
          algorithm works better when you are.
        </p>
      </header>

      {bootstrapped && total > 0 && !done && (
        <Progress
          value={Math.round(((index) / total) * 100)}
          className="mb-4 h-1.5"
        />
      )}

      {!bootstrapped ? null : total === 0 ? (
        <EmptyState stats={stats} />
      ) : done ? (
        <SessionComplete
          stats={sessionStats}
          srsStats={stats}
          onAgain={startOver}
        />
      ) : current ? (
        <ReviewCardView
          card={current}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onRate={rate}
          remaining={remaining}
          total={total}
        />
      ) : null}
    </div>
  );
}

function ReviewCardView({
  card,
  revealed,
  onReveal,
  onRate,
  remaining,
  total,
}: {
  card: ReviewCard;
  revealed: boolean;
  onReveal: () => void;
  onRate: (q: ReviewQuality) => void;
  remaining: number;
  total: number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
      >
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Card {total - remaining + 1} of {total}
              </span>
              <span>{remaining - 1} after this</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              {card.gender && (
                <Badge variant="outline" className="font-semibold uppercase">
                  {card.gender}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  {card.word}
                </h2>
                <AudioButton text={card.word} size="md" />
              </div>
              {card.partOfSpeech && card.partOfSpeech !== "other" && (
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {card.partOfSpeech}
                </span>
              )}
            </div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-xl border border-border/40 bg-muted/40 p-4 text-center"
                >
                  <p className="text-lg leading-relaxed">{card.meaning}</p>
                  {card.example && (
                    <div className="rounded-md bg-background/60 p-3 text-left text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="italic">{card.example}</p>
                        <AudioButton text={card.example} size="xs" rate={0.85} />
                      </div>
                      {card.exampleTranslation && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {card.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!revealed ? (
              <div className="flex justify-center">
                <Button size="lg" onClick={onReveal} className="min-w-44">
                  <Eye className="mr-2 h-4 w-4" /> Show meaning
                  <span className="ml-2 hidden text-xs opacity-70 sm:inline">
                    (Space)
                  </span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {QUALITY_BUTTONS.map((b, i) => (
                  <Button
                    key={b.value}
                    variant={b.variant}
                    onClick={() => onRate(b.value)}
                    className="h-auto flex-col py-2.5"
                  >
                    <span className="font-display text-sm font-semibold">
                      {b.label}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {b.hint} · {i + 1}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function EmptyState({ stats }: { stats: ReturnType<typeof getStats> }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
      <Brain className="mx-auto h-8 w-8 text-primary" />
      <h2 className="mt-3 font-display text-2xl font-semibold">
        All caught up!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {stats.total === 0
          ? "Your review queue is empty. Add words to it from any reading — tap a word, then 'Add to review'."
          : `No cards due today. You have ${stats.total} card${stats.total === 1 ? "" : "s"} in your collection.`}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link href="/practice/read">
            <BookOpen className="mr-2 h-4 w-4" /> Browse readings
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice">All modes</Link>
        </Button>
      </div>
    </div>
  );
}

function SessionComplete({
  stats,
  srsStats,
  onAgain,
}: {
  stats: { reviewed: number; correct: number; again: number };
  srsStats: ReturnType<typeof getStats>;
  onAgain: () => void;
}) {
  const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;
  return (
    <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-primary" />
      <h2 className="mt-3 font-display text-2xl font-semibold">
        Session complete
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Reviewed <span className="font-medium text-foreground">{stats.reviewed}</span> card
        {stats.reviewed === 1 ? "" : "s"} — accuracy {accuracy}%.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Total cards" value={srsStats.total} />
        <Stat label="Due tomorrow" value={srsStats.dueInNext7Days[1] ?? 0} />
        <Stat label="7-day retention" value={`${Math.round(srsStats.retentionLast7Days * 100)}%`} />
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={onAgain} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Review again
        </Button>
        <Button asChild>
          <Link href="/practice">
            More practice <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
