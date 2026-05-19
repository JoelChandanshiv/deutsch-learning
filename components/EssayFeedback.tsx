"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Sparkles, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EssayFeedback as FeedbackData } from "@/app/api/grade-essay/route";
import { cn } from "@/lib/utils";

type Props = {
  feedback: FeedbackData;
  onNext?: () => void;
};

function scoreColor(s: number): string {
  if (s >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (s >= 6) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={cn("font-display font-semibold tabular-nums", scoreColor(value))}>
          {value.toFixed(1)}
          <span className="ml-0.5 text-[10px] text-muted-foreground">/10</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            value >= 8 ? "bg-emerald-500" : value >= 6 ? "bg-amber-500" : "bg-rose-500",
          )}
        />
      </div>
    </div>
  );
}

export function EssayFeedback({ feedback, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl">Feedback</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{feedback.summary}</p>
            </div>
            <div className="text-right">
              <div className={cn("font-display text-4xl font-bold", scoreColor(feedback.overallScore))}>
                {feedback.overallScore.toFixed(1)}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Overall · /10
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreBar label="Grammar" value={feedback.grammarScore} />
            <ScoreBar label="Vocabulary" value={feedback.vocabularyScore} />
            <ScoreBar label="Structure" value={feedback.structureScore} />
            <ScoreBar label="Coherence" value={feedback.coherenceScore} />
          </div>
        </CardContent>
      </Card>

      {feedback.strengths.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {feedback.improvements.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {feedback.corrections.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Corrections</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {feedback.corrections.map((c, i) => (
                <li key={i} className="rounded-lg border border-border/40 bg-muted/30 p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through">
                      {c.original}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {c.corrected}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.explanation}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {feedback.betterPhrasings && feedback.betterPhrasings.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Sparkles className="h-4 w-4 text-primary" /> Native-style phrasings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {feedback.betterPhrasings.map((p, i) => (
                <li key={i} className="rounded-lg border border-border/40 bg-muted/30 p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-muted-foreground italic">{p.original}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-primary">{p.improved}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.reason}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {onNext && (
        <div className="flex justify-center pt-2">
          <Button onClick={onNext} size="lg" variant="outline">
            Try another prompt <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
