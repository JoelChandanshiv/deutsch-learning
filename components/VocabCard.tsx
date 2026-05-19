"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Check, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioButton } from "@/components/AudioButton";
import { cn } from "@/lib/utils";
import type { VocabWord } from "@/lib/vocabPacks";

type Props = {
  word: VocabWord;
  onKnow: () => void;
  onNext: () => void;
  onAddToReview: () => void;
  inReview?: boolean;
  isMastered?: boolean;
};

export function VocabCard({
  word,
  onKnow,
  onNext,
  onAddToReview,
  inReview,
  isMastered,
}: Props) {
  const [revealed, setRevealed] = React.useState(false);

  // reset reveal whenever the word changes
  React.useEffect(() => {
    setRevealed(false);
  }, [word.word]);

  function handleKey(e: React.KeyboardEvent) {
    if (!revealed && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      setRevealed(true);
    }
  }

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKey}
      className="space-y-3 focus:outline-none"
    >
      <Card
        className={cn(
          "relative min-h-[300px] cursor-pointer overflow-hidden border-2 transition-colors",
          revealed
            ? "border-primary/50 bg-card"
            : "border-border/60 hover:border-primary/40",
        )}
        onClick={() => !revealed && setRevealed(true)}
      >
        <CardContent className="flex h-full flex-col p-6 md:p-8">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
              >
                {word.gender && (
                  <Badge variant="outline" className="font-semibold uppercase">
                    {word.gender}
                  </Badge>
                )}
                <h2 className="text-balance font-display text-4xl font-bold tracking-tight md:text-5xl">
                  {word.word}
                </h2>
                <AudioButton text={word.word} size="md" />
                {word.partOfSpeech && word.partOfSpeech !== "other" && (
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {word.partOfSpeech}
                  </span>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Tap card or press{" "}
                  <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">
                    Space
                  </kbd>{" "}
                  to reveal
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-1 flex-col gap-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    {word.gender && (
                      <Badge variant="outline" className="font-semibold uppercase">
                        {word.gender}
                      </Badge>
                    )}
                    <span className="font-display text-2xl font-bold">
                      {word.word}
                    </span>
                    <AudioButton text={word.word} size="sm" />
                  </div>
                  {isMastered && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-500">
                      <Check className="mr-1 h-3 w-3" /> Mastered
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-medium leading-snug">{word.meaning}</p>

                <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base italic leading-relaxed">"{word.example}"</p>
                    <AudioButton
                      text={word.example}
                      size="xs"
                      rate={0.85}
                      className="-mr-1 -mt-0.5"
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {word.exampleTranslation}
                  </p>
                </div>

                {word.whyItMatters && (
                  <div className="flex gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="leading-relaxed">{word.whyItMatters}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!revealed}
          className="h-auto py-3"
        >
          <span className="flex flex-col items-center text-xs">
            <span className="font-display text-sm font-semibold">Still learning</span>
            <span className="text-[10px] opacity-70">Next card</span>
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={onAddToReview}
          disabled={!revealed || inReview}
          className={cn(
            "h-auto py-3",
            inReview && "opacity-60",
          )}
        >
          <span className="flex flex-col items-center text-xs">
            <span className="flex items-center gap-1 font-display text-sm font-semibold">
              <Brain className="h-3.5 w-3.5" />
              {inReview ? "In review" : "To review"}
            </span>
            <span className="text-[10px] opacity-70">SRS queue</span>
          </span>
        </Button>
        <Button
          onClick={onKnow}
          disabled={!revealed}
          className="h-auto py-3"
        >
          <span className="flex flex-col items-center text-xs">
            <span className="flex items-center gap-1 font-display text-sm font-semibold">
              <Check className="h-3.5 w-3.5" />
              Know it
            </span>
            <span className="text-[10px] opacity-70">+1 XP, mastered</span>
          </span>
        </Button>
      </div>

      <div className="text-center text-[10px] text-muted-foreground">
        <ChevronRight className="inline h-3 w-3" /> Next: <kbd className="rounded border bg-muted px-1 py-0.5">→</kbd> or <kbd className="rounded border bg-muted px-1 py-0.5">Enter</kbd>
      </div>
    </div>
  );
}
