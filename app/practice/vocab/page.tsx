"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookMarked, Brain, Check, Flame, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LevelSelector } from "@/components/LevelSelector";
import { LevelBadge } from "@/components/LevelBadge";
import { AudioButton } from "@/components/AudioButton";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, type CEFRLevel } from "@/lib/xp";
import {
  getPacks,
  getMasteredCount,
  getPackProgress,
  getWordOfDay,
  getDailyChallenge,
  VOCAB_LEVELS,
  type VocabPack,
} from "@/lib/vocabPacks";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  amber: "from-amber-500/10 to-amber-500/5 border-amber-500/40 text-amber-700 dark:text-amber-300",
  rose: "from-rose-500/10 to-rose-500/5 border-rose-500/40 text-rose-700 dark:text-rose-300",
  emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  sky: "from-sky-500/10 to-sky-500/5 border-sky-500/40 text-sky-700 dark:text-sky-300",
  violet: "from-violet-500/10 to-violet-500/5 border-violet-500/40 text-violet-700 dark:text-violet-300",
  teal: "from-teal-500/10 to-teal-500/5 border-teal-500/40 text-teal-700 dark:text-teal-300",
  orange: "from-orange-500/10 to-orange-500/5 border-orange-500/40 text-orange-700 dark:text-orange-300",
  primary: "from-primary/10 to-primary/5 border-primary/40 text-primary",
};

export default function VocabIndex() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const packs = getPacks(level);
  const masteredCount = useStore(getMasteredCount, 0);
  const wod = getWordOfDay(level);
  const challenge = useStore(() => getDailyChallenge(level), {
    words: [],
    completed: false,
  });
  const challengeCount = challenge.words.length;

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <LevelSelector enabledLevels={VOCAB_LEVELS.length > 0 ? VOCAB_LEVELS : ["A1", "A2", "B1"]} />
      </div>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <BookMarked className="h-4 w-4" /> Vocabulary
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Build your German vocabulary
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Curated word packs by topic. Tap a card to reveal meaning, hear it pronounced, mark it as known, or send it to your review queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Trophy className="mr-1 h-3 w-3" /> {masteredCount} mastered
          </Badge>
        </div>
      </header>

      {packs.length === 0 ? (
        <Card className="border-border/60">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <LevelBadge level={level} />
              <Badge variant="outline" className="text-xs">No packs yet</Badge>
            </div>
            <CardTitle className="font-display text-xl">
              No vocabulary packs at {level} yet
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Vocabulary content is being prepared for this level. Try another level
              that has content, or check back soon.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {challengeCount > 0 && (
            <Link href={`/practice/vocab/challenge`} className="group block">
              <Card
                className={cn(
                  "mb-6 border-2 bg-gradient-to-br transition-colors",
                  challenge.completed
                    ? "border-emerald-500/40 from-emerald-500/5 to-transparent"
                    : "border-primary/50 from-primary/10 to-transparent group-hover:border-primary",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
                        challenge.completed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-primary/15 text-primary",
                      )}
                    >
                      {challenge.completed ? <Check className="h-6 w-6" /> : <Flame className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="font-display text-lg">
                        Daily Word Challenge
                        {challenge.completed && (
                          <Badge className="ml-2 bg-emerald-500 px-2 py-0 text-xs hover:bg-emerald-500">
                            Done today
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-sm">
                        {challenge.completed
                          ? "Come back tomorrow for 5 fresh words."
                          : `${challengeCount} fresh words from your level — finishable in 60 seconds.`}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {challenge.completed ? "Review" : "Start"} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardHeader>
              </Card>
            </Link>
          )}

          {wod && (
            <Card className="mb-6 border-border/60 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> Word of the day
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      {wod.gender && (
                        <Badge variant="outline" className="font-semibold uppercase">
                          {wod.gender}
                        </Badge>
                      )}
                      <span className="font-display text-3xl font-bold">{wod.word}</span>
                      <AudioButton text={wod.word} size="sm" />
                    </div>
                    <p className="mt-1 text-base text-muted-foreground">{wod.meaning}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border/40 bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="italic">"{wod.example}"</p>
                    <AudioButton text={wod.example} size="xs" rate={0.85} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{wod.exampleTranslation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
            Topic packs
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <PackTile key={p.id} pack={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PackTile({ pack }: { pack: VocabPack }) {
  const progress = useStore(() => getPackProgress(pack), { mastered: 0, total: pack.words.length });
  const pct = progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0;
  const complete = progress.mastered === progress.total && progress.total > 0;
  const accent = ACCENT[pack.color] ?? ACCENT.primary;

  return (
    <Link href={`/practice/vocab/${pack.id}`} className="group">
      <Card
        className={cn(
          "h-full border bg-gradient-to-br transition-colors group-hover:border-primary/60",
          accent,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-3xl" role="img" aria-hidden>
              {pack.icon}
            </span>
            {complete && (
              <Badge className="bg-emerald-500 px-2 py-0 hover:bg-emerald-500">
                <Trophy className="mr-1 h-3 w-3" /> Complete
              </Badge>
            )}
          </div>
          <CardTitle className="font-display text-lg leading-tight">{pack.title}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {pack.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {progress.mastered}/{progress.total} mastered
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="mt-1.5 h-1.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
