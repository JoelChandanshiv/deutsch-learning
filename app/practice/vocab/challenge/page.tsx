"use client";

import * as React from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/LevelBadge";
import { VocabCard } from "@/components/VocabCard";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, addXP, type CEFRLevel } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";
import {
  getDailyChallenge,
  isMastered as isWordMastered,
  markMastered,
  markDailyChallengeComplete,
  type VocabWord,
} from "@/lib/vocabPacks";
import { addWordToReview, hasCard as hasSRSCard } from "@/lib/srs";

const KNOW_XP = 1;
const CHALLENGE_COMPLETE_XP = 25;

export default function DailyChallengePage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const [words, setWords] = React.useState<VocabWord[]>([]);
  const [completedAlready, setCompletedAlready] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const [stats, setStats] = React.useState({ known: 0, added: 0 });
  const [refresh, setRefresh] = React.useState(0);
  const [celebrated, setCelebrated] = React.useState(false);

  React.useEffect(() => {
    const { words, completed } = getDailyChallenge(level);
    setWords(words);
    setCompletedAlready(completed);
    setIndex(0);
    setStats({ known: 0, added: 0 });
    setCelebrated(false);
    setBootstrapped(true);
  }, [level]);

  const current = words[index];
  const total = words.length;
  const done = bootstrapped && total > 0 && index >= total;
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;

  const inReview = React.useMemo(
    () => (current ? hasSRSCard(current.word) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.word, refresh],
  );
  const masteredNow = React.useMemo(
    () => (current ? isWordMastered(current.word) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.word, refresh],
  );

  function handleKnow() {
    if (!current) return;
    markMastered(current.word);
    addXP(KNOW_XP);
    recordActivity();
    setStats((s) => ({ ...s, known: s.known + 1 }));
    setRefresh((r) => r + 1);
    setIndex((i) => i + 1);
  }

  function handleAddToReview() {
    if (!current) return;
    addWordToReview({
      word: current.word,
      meaning: current.meaning,
      partOfSpeech: current.partOfSpeech,
      gender: current.gender ?? null,
      example: current.example,
      exampleTranslation: current.exampleTranslation,
    });
    setStats((s) => ({ ...s, added: s.added + 1 }));
    setRefresh((r) => r + 1);
  }

  function handleNext() {
    setIndex((i) => i + 1);
  }

  // Award completion XP + mark challenge as done — only once per session
  React.useEffect(() => {
    if (done && !completedAlready && !celebrated) {
      setCelebrated(true);
      markDailyChallengeComplete(level);
      addXP(CHALLENGE_COMPLETE_XP);
      recordActivity();
      confetti({
        particleCount: 60,
        spread: 60,
        startVelocity: 30,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice/vocab">
            <ArrowLeft className="mr-1 h-4 w-4" /> Vocabulary
          </Link>
        </Button>
        <LevelBadge level={level} />
      </div>

      <header className="mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Flame className="h-4 w-4" /> Daily Word Challenge
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {total > 0 ? `5 fresh words at ${level}` : "Loading..."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick warm-up. Finish to earn{" "}
          <Badge variant="secondary" className="px-1.5 py-0">
            +{CHALLENGE_COMPLETE_XP} XP
          </Badge>{" "}
          and keep your streak alive.
        </p>
        {total > 0 && (
          <>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="tabular-nums">Card {Math.min(index + 1, total)} of {total}</span>
              <span>{stats.known} known · {stats.added} sent to review</span>
            </div>
            <Progress value={pct} className="mt-1.5 h-1.5" />
          </>
        )}
      </header>

      {!bootstrapped ? null : total === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
          No vocabulary packs at {level} yet — nothing to challenge with.
        </div>
      ) : !done && current ? (
        <VocabCard
          word={current}
          onKnow={handleKnow}
          onNext={handleNext}
          onAddToReview={handleAddToReview}
          inReview={inReview}
          isMastered={masteredNow}
        />
      ) : (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 font-display text-2xl font-semibold">
            {completedAlready && !celebrated ? "Already done today" : "Challenge complete!"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {completedAlready && !celebrated ? (
              <>You finished today&apos;s challenge earlier. Come back tomorrow for a fresh set.</>
            ) : (
              <>
                <span className="font-medium text-foreground">{stats.known}</span> marked as known,{" "}
                <span className="font-medium text-foreground">{stats.added}</span> sent to review.{" "}
                <span className="font-medium text-primary">+{CHALLENGE_COMPLETE_XP} XP</span>.
              </>
            )}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/practice/vocab">
                Browse packs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/practice/review">
                Review queue
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
