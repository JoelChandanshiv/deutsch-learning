"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getTranslations, LEVELS_WITH_CONTENT, type TranslationDrill as DrillType } from "@/lib/content";
import { useStore } from "@/lib/useStore";
import { addXP, getSelectedLevel, XP_REWARDS, type CEFRLevel } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";
import { LevelSelector } from "@/components/LevelSelector";
import { TranslationDrill } from "@/components/TranslationDrill";
import { Button } from "@/components/ui/button";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TranslatePracticePage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const [queue, setQueue] = React.useState<DrillType[]>([]);
  const [stats, setStats] = React.useState({ correct: 0, total: 0, streak: 0 });

  React.useEffect(() => {
    setQueue(shuffle(getTranslations(level)));
    setStats({ correct: 0, total: 0, streak: 0 });
  }, [level]);

  const current = queue[0];

  function handleResult(result: { status: "correct" | "close" | "incorrect" }) {
    setStats((s) => ({
      correct: s.correct + (result.status === "correct" ? 1 : 0),
      total: s.total + 1,
      streak: result.status === "correct" ? s.streak + 1 : 0,
    }));
    if (result.status === "correct") {
      addXP(XP_REWARDS.correctTranslation);
      recordActivity();
    } else if (result.status === "close") {
      addXP(XP_REWARDS.closeTranslation);
      recordActivity();
    }
  }

  function handleNext() {
    setQueue((q) => q.slice(1));
  }

  function restart() {
    setQueue(shuffle(getTranslations(level)));
    setStats({ correct: 0, total: 0, streak: 0 });
  }

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

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
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Translation Drills
          </h1>
          <p className="text-sm text-muted-foreground">
            Translate the prompt. Press <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd> to check.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Stat label="Correct" value={`${stats.correct}/${stats.total}`} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Streak" value={`${stats.streak}`} highlight={stats.streak >= 3} />
        </div>
      </header>

      {current ? (
        <TranslationDrill drill={current} onNext={handleNext} onResult={handleResult} />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-2xl font-semibold">
            Set complete!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You finished all {level} drills with{" "}
            <span className="font-medium text-foreground">{accuracy}% accuracy</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={restart}>Practice again</Button>
            <Button asChild variant="outline">
              <Link href="/practice">Try another mode</Link>
            </Button>
          </div>
        </div>
      )}
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
