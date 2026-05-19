"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelSelector } from "@/components/LevelSelector";
import { LevelBadge } from "@/components/LevelBadge";
import { ListenAndType } from "@/components/ListenAndType";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, addXP, type CEFRLevel } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";
import { getReadings, LEVELS_WITH_CONTENT, type Reading } from "@/lib/content";

const LISTEN_XP = 15;

type Sentence = {
  text: string;
  translation: string;
  source: string; // reading title
};

function splitSentences(passage: string): string[] {
  return passage
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildSentences(readings: Reading[]): Sentence[] {
  const out: Sentence[] = [];
  for (const r of readings) {
    const deSentences = splitSentences(r.passage);
    const enSentences = splitSentences(r.translation);
    for (let i = 0; i < deSentences.length; i++) {
      out.push({
        text: deSentences[i],
        translation: enSentences[i] ?? "",
        source: r.title,
      });
    }
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ListenPage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const [queue, setQueue] = React.useState<Sentence[]>([]);
  const [index, setIndex] = React.useState(0);
  const [stats, setStats] = React.useState({ correct: 0, total: 0 });

  React.useEffect(() => {
    const readings = getReadings(level);
    const all = buildSentences(readings);
    // limit to 20 sentences per session
    setQueue(shuffle(all).slice(0, 20));
    setIndex(0);
    setStats({ correct: 0, total: 0 });
  }, [level]);

  const current = queue[index];
  const total = queue.length;
  const done = total > 0 && index >= total;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  function handleResult(correct: boolean) {
    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    if (correct) {
      addXP(LISTEN_XP);
      recordActivity();
    }
  }

  function handleNext() {
    setIndex((i) => i + 1);
  }

  function restart() {
    const readings = getReadings(level);
    const all = buildSentences(readings);
    setQueue(shuffle(all).slice(0, 20));
    setIndex(0);
    setStats({ correct: 0, total: 0 });
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <LevelSelector enabledLevels={LEVELS_WITH_CONTENT} />
      </div>

      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Headphones className="h-4 w-4" /> Listening
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Train your ear
          </h1>
          <p className="text-sm text-muted-foreground">
            Listen, then type. Replay or slow it down as much as you need.
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Stat label="Sentence" value={`${Math.min(index + 1, total)}/${total}`} />
            <Stat label="Correct" value={`${stats.correct}/${stats.total}`} highlight={accuracy >= 70} />
          </div>
        )}
      </header>

      {queue.length === 0 ? (
        <Card className="border-border/60">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <LevelBadge level={level} />
              <Badge variant="outline" className="text-xs">No content yet</Badge>
            </div>
            <CardTitle className="font-display text-xl">
              No readings at {level}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Add readings at this level (or switch to A1/A2) to start the
              listening exercise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/practice/read">Browse readings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : done ? (
        <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-2xl font-semibold">
            Session complete
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You got{" "}
            <span className="font-medium text-foreground">
              {stats.correct} of {stats.total}
            </span>{" "}
            sentences right — {accuracy}% accuracy.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={restart}>Listen again</Button>
            <Button asChild variant="outline">
              <Link href="/practice">
                More practice <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : current ? (
        <>
          <div className="mb-3 text-xs text-muted-foreground">
            From: <span className="font-medium text-foreground">{current.source}</span>
          </div>
          <ListenAndType
            sentence={current.text}
            translation={current.translation}
            onResult={handleResult}
            onNext={handleNext}
            isLast={index === total - 1}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Each correct sentence earns{" "}
            <Badge variant="secondary" className="px-1.5 py-0">+{LISTEN_XP} XP</Badge>
          </p>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "font-display text-base font-semibold " +
          (highlight ? "text-primary" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
