"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, HelpCircle, Loader2, PenTool, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelSelector } from "@/components/LevelSelector";
import { LevelBadge } from "@/components/LevelBadge";
import { WritingPad } from "@/components/WritingPad";
import { EssayFeedback } from "@/components/EssayFeedback";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, addXP, type CEFRLevel } from "@/lib/xp";
import { recordActivity } from "@/lib/streaks";
import { getWritingPrompts, WRITING_LEVELS, type WritingPrompt } from "@/lib/writingPrompts";
import type { EssayFeedback as FeedbackData } from "@/app/api/grade-essay/route";

const ESSAY_XP_THRESHOLD = 6;
const ESSAY_XP_REWARD = 50;

function pickRandom<T>(arr: T[], exclude?: string): T | null {
  if (arr.length === 0) return null;
  const candidates = exclude ? arr.filter((x: any) => x.id !== exclude) : arr;
  const pool = candidates.length > 0 ? candidates : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WritePage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A2");
  const prompts = getWritingPrompts(level);
  const [prompt, setPrompt] = React.useState<WritingPrompt | null>(null);
  const [essay, setEssay] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showHints, setShowHints] = React.useState(false);

  React.useEffect(() => {
    setPrompt(pickRandom(prompts));
    setEssay("");
    setFeedback(null);
    setError(null);
    setShowHints(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function newPrompt() {
    if (!prompts.length) return;
    setPrompt(pickRandom(prompts, prompt?.id));
    setEssay("");
    setFeedback(null);
    setError(null);
    setShowHints(false);
  }

  async function handleSubmit() {
    if (!prompt || !essay.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.prompt, essay, level }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Grading failed (${res.status})`);
      }
      const data: FeedbackData = await res.json();
      setFeedback(data);
      if (data.overallScore >= ESSAY_XP_THRESHOLD) {
        addXP(ESSAY_XP_REWARD);
      }
      recordActivity();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const [minWords, maxWords] = prompt?.suggestedLength ?? [60, 100];

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <LevelSelector enabledLevels={WRITING_LEVELS} />
      </div>

      <header className="mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <PenTool className="h-4 w-4" /> Writing
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Write an essay, get AI feedback
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a prompt, write a short essay in German, and get scored on
          grammar, vocabulary, structure and coherence.
        </p>
      </header>

      {prompts.length === 0 ? (
        <Card className="border-border/60">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <LevelBadge level={level} />
              <Badge variant="outline" className="text-xs">No prompts yet</Badge>
            </div>
            <CardTitle className="font-display text-xl">
              No writing prompts at {level}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Writing prompts are currently available for A2 and B1. Switch
              levels above to begin.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : prompt ? (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LevelBadge level={prompt.level} />
                <Badge variant="secondary" className="text-xs capitalize">
                  {prompt.topic.replace(/-/g, " ")}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={newPrompt}
                disabled={submitting}
              >
                <Shuffle className="mr-2 h-3.5 w-3.5" /> New prompt
              </Button>
            </div>
            <CardTitle className="mt-2 font-display text-lg leading-snug md:text-xl">
              {prompt.prompt}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Suggested length: {minWords}–{maxWords} words
              </span>
              {prompt.hints.length > 0 && (
                <button
                  onClick={() => setShowHints((v) => !v)}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <HelpCircle className="h-3 w-3" />
                  {showHints ? "Hide hints" : "Show hints"}
                </button>
              )}
            </div>
          </CardHeader>
          {showHints && (
            <CardContent className="pt-0">
              <ul className="space-y-1.5 rounded-lg border border-border/40 bg-muted/40 p-3 text-xs">
                {prompt.hints.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      ) : null}

      {prompt && (
        <div className="mt-6 space-y-4">
          <WritingPad
            value={essay}
            onChange={setEssay}
            draftKey={prompt.id}
            targetMin={minWords}
            targetMax={maxWords}
            disabled={submitting}
            placeholder="Schreib hier deine Antwort auf Deutsch…"
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !essay.trim() || essay.trim().split(/\s+/).length < 20}
              size="lg"
              className="min-w-44"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading…
                </>
              ) : (
                <>
                  Submit for feedback <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {submitting && !feedback && (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-xl bg-muted/50" />
              <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
              <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
            </div>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {feedback.overallScore >= ESSAY_XP_THRESHOLD && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                      Score ≥ {ESSAY_XP_THRESHOLD} —{" "}
                      <Badge variant="secondary" className="px-1.5 py-0">
                        +{ESSAY_XP_REWARD} XP
                      </Badge>{" "}
                      awarded.
                    </span>
                  </div>
                )}
                <EssayFeedback feedback={feedback} onNext={newPrompt} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
