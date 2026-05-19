"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, HelpCircle, Loader2, X } from "lucide-react";
import confetti from "canvas-confetti";
import type { TranslationDrill as DrillType } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/LevelBadge";
import { cn } from "@/lib/utils";

type GradeResult = {
  status: "correct" | "close" | "incorrect";
  feedback: string;
  correctedAnswer?: string;
  encouragement?: string;
};

const STATUS_STYLES: Record<GradeResult["status"], string> = {
  correct: "border-emerald-500/40 bg-emerald-500/5",
  close: "border-amber-500/40 bg-amber-500/5",
  incorrect: "border-rose-500/40 bg-rose-500/5",
};

const STATUS_ICONS = {
  correct: <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
  close: <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  incorrect: <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
};

const STATUS_LABEL = {
  correct: "Correct",
  close: "Almost there",
  incorrect: "Not quite",
};

export function TranslationDrill({
  drill,
  onNext,
  onResult,
}: {
  drill: DrillType;
  onNext: () => void;
  onResult: (result: GradeResult) => void;
}) {
  const [answer, setAnswer] = React.useState("");
  const [showHint, setShowHint] = React.useState(false);
  const [grading, setGrading] = React.useState(false);
  const [result, setResult] = React.useState<GradeResult | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setAnswer("");
    setShowHint(false);
    setResult(null);
    setGrading(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [drill.id]);

  async function handleCheck() {
    if (!answer.trim() || grading) return;
    setGrading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: drill.prompt,
          userAnswer: answer,
          correctAnswer: drill.answer,
          alternatives: drill.alternatives,
          level: drill.level,
          direction: drill.direction,
        }),
      });
      const data: GradeResult = await res.json();
      setResult(data);
      onResult(data);
      if (data.status === "correct") {
        // small chime via tiny confetti burst
        confetti({
          particleCount: 30,
          spread: 50,
          startVelocity: 25,
          origin: { y: 0.6 },
          disableForReducedMotion: true,
        });
      }
    } catch {
      const fallback: GradeResult = {
        status: "incorrect",
        feedback: "Network error. Try again.",
        correctedAnswer: drill.answer,
      };
      setResult(fallback);
      onResult(fallback);
    } finally {
      setGrading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      if (result) onNext();
      else handleCheck();
    }
  }

  const promptLanguage =
    drill.direction === "en-to-de" ? "English → German" : "German → English";
  const inputPlaceholder =
    drill.direction === "en-to-de" ? "Type your German translation…" : "Type your English translation…";

  return (
    <Card
      className={cn(
        "border-border/60 transition-colors",
        result && STATUS_STYLES[result.status],
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs font-medium">
            {promptLanguage}
          </Badge>
          <div className="flex items-center gap-2">
            <LevelBadge level={drill.level} />
            <Badge variant="secondary" className="text-xs capitalize">
              {drill.topic.replace(/-/g, " ")}
            </Badge>
          </div>
        </div>
        <p className="text-balance text-xl font-display font-medium md:text-2xl">
          {drill.prompt}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          rows={3}
          disabled={!!result}
          className="resize-none text-base leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHint((s) => !s)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="mr-1 h-3.5 w-3.5" />
            {showHint ? "Hide hint" : "Show hint"}
          </Button>

          {result ? (
            <Button onClick={onNext} size="lg" className="min-w-32">
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCheck}
              size="lg"
              className="min-w-32"
              disabled={!answer.trim() || grading}
            >
              {grading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
                </>
              ) : (
                <>Check</>
              )}
            </Button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {showHint && !result && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-lg border border-border/60 bg-muted/50 p-3 text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">Hint:</span> {drill.hint}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 rounded-lg border border-border/40 bg-background/60 p-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                {STATUS_ICONS[result.status]}
                <span>{STATUS_LABEL[result.status]}</span>
                {result.encouragement && (
                  <span className="text-muted-foreground font-normal">
                    — {result.encouragement}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{result.feedback}</p>
              {result.status !== "correct" && (
                <div className="rounded-md bg-muted/60 p-3 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Expected
                  </p>
                  <p className="mt-1 font-medium">
                    {result.correctedAnswer ?? drill.answer}
                  </p>
                </div>
              )}
              <div className="rounded-md border border-border/40 bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Note:</span>{" "}
                {drill.grammarNote}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
