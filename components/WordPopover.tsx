"use client";

import * as React from "react";
import { Loader2, Plus, Volume2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VocabularyEntry } from "@/lib/content";
import { recordLookup } from "@/lib/vocabulary";
import type { WordTranslation } from "@/app/api/translate/route";
import { cn } from "@/lib/utils";

type Props = {
  word: string;
  context?: string;
  vocab?: VocabularyEntry;
  source?: string;
  children: React.ReactNode;
};

function vocabToTranslation(v: VocabularyEntry): WordTranslation {
  const t = v.type;
  let pos = "other";
  let gender: WordTranslation["gender"] = null;
  if (t.startsWith("noun")) {
    pos = "noun";
    if (t.endsWith("masculine")) gender = "der";
    else if (t.endsWith("feminine")) gender = "die";
    else if (t.endsWith("neuter")) gender = "das";
  } else if (t.startsWith("verb")) pos = "verb";
  else if (t === "adjective") pos = "adjective";
  else if (t === "adverb") pos = "adverb";
  return {
    word: v.word,
    meaning: v.meaning,
    partOfSpeech: pos,
    gender,
    example: "",
    exampleTranslation: "",
  };
}

function speakGerman(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "de-DE";
    utter.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {
    // browser may block, fail silently
  }
}

export function WordPopover({ word, context, vocab, source, children }: Props) {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<WordTranslation | null>(
    vocab ? vocabToTranslation(vocab) : null,
  );
  const [loading, setLoading] = React.useState(false);
  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    // Always fetch if we don't have full data (example sentence) and haven't fetched yet
    if (data && data.example) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ word, context }),
    })
      .then((r) => r.json())
      .then((d: WordTranslation) => {
        const merged: WordTranslation = data
          ? { ...data, ...d, meaning: data.meaning || d.meaning, gender: data.gender ?? d.gender }
          : d;
        setData(merged);
      })
      .catch(() => {
        if (!data) {
          setData({
            word,
            meaning: "(could not load)",
            partOfSpeech: "other",
            gender: null,
            example: "",
            exampleTranslation: "",
          });
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSave() {
    if (!data) return;
    recordLookup({
      word: data.word,
      meaning: data.meaning,
      partOfSpeech: data.partOfSpeech,
      gender: data.gender,
      example: data.example,
      exampleTranslation: data.exampleTranslation,
      source,
    });
  }

  return (
    <Popover open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && data) {
        // record that the user looked this up
        recordLookup({
          word: data.word,
          meaning: data.meaning,
          partOfSpeech: data.partOfSpeech,
          gender: data.gender,
          example: data.example,
          exampleTranslation: data.exampleTranslation,
          source,
        });
      }
    }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-72 p-0"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                {data?.gender && (
                  <Badge variant="outline" className="font-semibold uppercase">
                    {data.gender}
                  </Badge>
                )}
                <span className="font-display text-lg font-semibold">
                  {data?.word ?? word}
                </span>
              </div>
              {data?.partOfSpeech && data.partOfSpeech !== "other" && (
                <span className="text-xs text-muted-foreground capitalize">
                  {data.partOfSpeech}
                </span>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                className={cn("h-7 w-7", !data && "opacity-50")}
                onClick={() => speakGerman(data?.word ?? word)}
                aria-label="Pronounce"
                disabled={!data}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={cn("h-7 w-7", !data && "opacity-50")}
                onClick={handleSave}
                aria-label="Save to vocabulary"
                disabled={!data}
                title="Add to vocabulary"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-3 min-h-[2rem]">
            {loading && !data ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Translating…
              </div>
            ) : data ? (
              <>
                <p className="text-sm leading-relaxed">{data.meaning}</p>
                {data.example && (
                  <div className="mt-3 rounded-md border border-border/50 bg-muted/40 p-2.5 text-xs">
                    <p className="font-medium italic">{data.example}</p>
                    {data.exampleTranslation && (
                      <p className="mt-1 text-muted-foreground">
                        {data.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
