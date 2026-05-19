"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { getReading } from "@/lib/content";
import { ReadingPassage } from "@/components/ReadingPassage";
import { LevelBadge } from "@/components/LevelBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addXP, XP_REWARDS } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";

export default function ReadingDetailPage() {
  const params = useParams<{ id: string }>();
  const reading = getReading(params.id);

  const [showTranslation, setShowTranslation] = React.useState(false);
  const [revealedAnswers, setRevealedAnswers] = React.useState<Set<number>>(new Set());
  const [completed, setCompleted] = React.useState(false);

  if (!reading) {
    notFound();
  }

  function toggleAnswer(i: number) {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleComplete() {
    if (completed) return;
    setCompleted(true);
    addXP(XP_REWARDS.completeReading);
    recordActivity();
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice/read">
            <ArrowLeft className="mr-1 h-4 w-4" /> Library
          </Link>
        </Button>
        <LevelBadge level={reading.level} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {reading.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap any underlined word for an instant translation. Try to read it
            once without help first.
          </p>

          <div className="mt-6 rounded-xl border border-border/60 bg-card p-6 md:p-8">
            <ReadingPassage
              text={reading.passage}
              vocabulary={reading.vocabulary}
              sourceId={reading.id}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTranslation((v) => !v)}
              size="sm"
            >
              {showTranslation ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" /> Hide full translation
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Show full translation
                </>
              )}
            </Button>

            <Button
              onClick={handleComplete}
              disabled={completed}
              className="min-w-44"
            >
              {completed ? (
                <>
                  <Check className="mr-1 h-4 w-4" /> Completed (+{XP_REWARDS.completeReading} XP)
                </>
              ) : (
                <>Mark complete (+{XP_REWARDS.completeReading} XP)</>
              )}
            </Button>
          </div>

          {showTranslation && (
            <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Full translation
              </p>
              <p className="mt-2 leading-relaxed">{reading.translation}</p>
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Vocabulary in this passage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {reading.vocabulary.map((v) => (
                <div key={v.word} className="flex items-baseline justify-between gap-3 py-1">
                  <span className="font-medium">{v.word}</span>
                  <span className="text-right text-xs text-muted-foreground">
                    {v.meaning}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Comprehension
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {reading.comprehensionQuestions.map((q, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-medium">{q.q}</p>
                  <button
                    onClick={() => toggleAnswer(i)}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    {revealedAnswers.has(i) ? "Hide answer" : "Show answer"}
                  </button>
                  {revealedAnswers.has(i) && (
                    <p className="text-muted-foreground">{q.a}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
