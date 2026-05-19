"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Eye, EyeOff, Gauge, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { speak, cancel, isAvailable } from "@/lib/tts";
import { cn } from "@/lib/utils";

type Props = {
  sentence: string;
  translation?: string;
  onResult: (correct: boolean) => void;
  onNext: () => void;
  isLast?: boolean;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,!?;:"'„""''»«()\[\]{}-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

type Token = { word: string; status: "match" | "wrong" | "missing" | "extra" };

/**
 * LCS-based word-level diff between expected and got.
 * Returns one array per side, marking each token's status.
 */
function diff(expected: string[], got: string[]): { exp: Token[]; got: Token[] } {
  const m = expected.length;
  const n = got.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (expected[i - 1] === got[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matchedExp = new Array(m).fill(false);
  const matchedGot = new Array(n).fill(false);
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (expected[i - 1] === got[j - 1]) {
      matchedExp[i - 1] = true;
      matchedGot[j - 1] = true;
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  const exp: Token[] = expected.map((w, idx) => ({
    word: w,
    status: matchedExp[idx] ? "match" : "missing",
  }));
  const gotMarked: Token[] = got.map((w, idx) => ({
    word: w,
    status: matchedGot[idx] ? "match" : "extra",
  }));
  return { exp, got: gotMarked };
}

export function ListenAndType({ sentence, translation, onResult, onNext, isLast }: Props) {
  const [input, setInput] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [speechOK, setSpeechOK] = React.useState(true);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setSpeechOK(isAvailable());
  }, []);

  React.useEffect(() => {
    setInput("");
    setChecked(false);
    setRevealed(false);
    // auto-play the sentence when it appears
    play(0.9);
    requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  function play(rate: number) {
    cancel();
    speak(sentence, {
      rate,
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }

  function handleCheck() {
    if (!input.trim()) return;
    const exp = tokenize(sentence);
    const got = tokenize(input);
    const matches = exp.filter((w, i) => got[i] === w).length;
    const correct = matches === exp.length && got.length === exp.length;
    setChecked(true);
    onResult(correct);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (checked) onNext();
      else handleCheck();
    }
  }

  const expTokens = React.useMemo(() => tokenize(sentence), [sentence]);
  const gotTokens = React.useMemo(() => tokenize(input), [input]);
  const result = React.useMemo(() => diff(expTokens, gotTokens), [expTokens, gotTokens]);
  const allMatched = checked && result.exp.every((t) => t.status === "match") && result.got.every((t) => t.status === "match");

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => play(0.9)}
          disabled={!speechOK || playing}
          variant="default"
        >
          {playing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {playing ? "Playing" : "Play"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => play(0.65)}
          disabled={!speechOK || playing}
        >
          <Gauge className="mr-2 h-4 w-4" /> Slower
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" /> Hide transcript
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" /> Show transcript
            </>
          )}
        </Button>
        {!speechOK && (
          <Badge variant="outline" className="text-xs">
            Audio not supported in this browser
          </Badge>
        )}
      </div>

      {revealed && (
        <div className="rounded-md border border-border/40 bg-muted/40 p-3 text-sm">
          <p className="font-medium italic">{sentence}</p>
          {translation && (
            <p className="mt-1 text-xs text-muted-foreground">{translation}</p>
          )}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type what you hear…"
        rows={3}
        disabled={checked}
        className="resize-none text-base leading-relaxed"
      />

      <div className="flex items-center justify-end gap-2">
        {checked ? (
          <Button onClick={onNext} size="lg">
            {isLast ? "Finish" : "Next"} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCheck} size="lg" disabled={!input.trim()}>
            Check
          </Button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "space-y-3 rounded-lg border p-4",
              allMatched
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-amber-500/40 bg-amber-500/5",
            )}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {allMatched ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Perfekt!
                </>
              ) : (
                <>Close — see the diff below.</>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Expected
              </p>
              <p className="mt-1 leading-relaxed">
                {result.exp.map((t, i) => (
                  <span
                    key={`e-${i}`}
                    className={cn(
                      "mr-1 inline-block rounded px-1",
                      t.status === "match"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through",
                    )}
                  >
                    {t.word}
                  </span>
                ))}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                You wrote
              </p>
              <p className="mt-1 leading-relaxed">
                {result.got.length === 0 ? (
                  <span className="text-muted-foreground">(nothing)</span>
                ) : (
                  result.got.map((t, i) => (
                    <span
                      key={`g-${i}`}
                      className={cn(
                        "mr-1 inline-block rounded px-1",
                        t.status === "match"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {t.word}
                    </span>
                  ))
                )}
              </p>
            </div>

            {translation && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Translation:</span>{" "}
                {translation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
