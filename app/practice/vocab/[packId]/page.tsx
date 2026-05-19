"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LevelBadge } from "@/components/LevelBadge";
import { VocabCard } from "@/components/VocabCard";
import { useStore } from "@/lib/useStore";
import { getPack, isMastered as isWordMastered, markMastered, getPackProgress } from "@/lib/vocabPacks";
import { addWordToReview, hasCard as hasSRSCard } from "@/lib/srs";
import { addXP } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";

const KNOW_XP = 1;
const PACK_COMPLETE_XP = 50;

export default function PackViewerPage() {
  const params = useParams<{ packId: string }>();
  const pack = getPack(params.packId);

  if (!pack) notFound();

  const [index, setIndex] = React.useState(0);
  const [refresh, setRefresh] = React.useState(0); // force re-read of mastered state
  const [celebrated, setCelebrated] = React.useState(false);
  const progress = useStore(
    () => getPackProgress(pack),
    { mastered: 0, total: pack.words.length },
  );

  const current = pack.words[index];
  const total = pack.words.length;
  const done = index >= total;
  const allMastered = progress.mastered === progress.total && progress.total > 0;

  // Confetti when the user reaches 100% in this pack (only once per session)
  React.useEffect(() => {
    if (allMastered && !celebrated) {
      setCelebrated(true);
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 35,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });
    }
  }, [allMastered, celebrated]);

  // Refresh-on-mastered: force the inReview/isMastered probes to re-run after we mutate
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
    setRefresh((r) => r + 1);
    handleNext();
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
    setRefresh((r) => r + 1);
  }

  function handleNext() {
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setRefresh((r) => r + 1);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || (e.key === "Enter" && !document.activeElement?.matches("button"))) {
        if (!done) handleNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Award completion XP once when the user finishes the deck AND mastered everything
  React.useEffect(() => {
    if (done && allMastered && !celebrated) {
      addXP(PACK_COMPLETE_XP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, allMastered]);

  const pct = total > 0 ? Math.round((index / total) * 100) : 0;

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice/vocab">
            <ArrowLeft className="mr-1 h-4 w-4" /> Packs
          </Link>
        </Button>
        <LevelBadge level={pack.level} />
      </div>

      <header className="mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {pack.icon}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {pack.title}
            </h1>
            <p className="text-sm text-muted-foreground">{pack.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            Card {Math.min(index + 1, total)} of {total}
          </span>
          <span className="tabular-nums">
            {progress.mastered}/{progress.total} mastered total
          </span>
        </div>
        <Progress value={pct} className="mt-1.5 h-1.5" />
      </header>

      {!done && current ? (
        <VocabCard
          word={current}
          onKnow={handleKnow}
          onNext={handleNext}
          onAddToReview={handleAddToReview}
          inReview={inReview}
          isMastered={masteredNow}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
          {allMastered ? (
            <>
              <Trophy className="mx-auto h-10 w-10 text-amber-500" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                Pack complete!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ve mastered all {total} words in <span className="font-medium text-foreground">{pack.title}</span> — well done. <span className="font-medium text-primary">+{PACK_COMPLETE_XP} XP</span> awarded.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                End of deck
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ve gone through all {total} cards. {progress.mastered}/{progress.total} marked as known. Run the deck again to drill the rest.
              </p>
            </>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={restart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Run again
            </Button>
            <Button asChild>
              <Link href="/practice/vocab">
                More packs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
