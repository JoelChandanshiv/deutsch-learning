"use client";

import * as React from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancel, isAvailable, speakPassage, type PassageProgress } from "@/lib/tts";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
};

export function PassagePlayer({ text, className }: Props) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState<PassageProgress | null>(null);
  const [available, setAvailable] = React.useState(true);

  React.useEffect(() => {
    setAvailable(isAvailable());
    return () => {
      cancel();
    };
  }, []);

  const total = progress?.totalSentences ?? 0;
  const idx = progress?.sentenceIndex ?? 0;
  const pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  async function handlePlay() {
    if (playing) {
      cancel();
      setPlaying(false);
      setProgress(null);
      return;
    }
    await speakPassage(text, {
      rate: 0.9,
      onStart: () => setPlaying(true),
      onSentence: (p) => setProgress(p),
      onEnd: () => {
        setPlaying(false);
        setProgress(null);
      },
      onError: () => {
        setPlaying(false);
        setProgress(null);
      },
    });
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        type="button"
        onClick={handlePlay}
        variant={playing ? "secondary" : "outline"}
        size="sm"
        disabled={!available}
        title={available ? "" : "Audio not supported in this browser"}
      >
        {!available ? (
          <>Audio unavailable</>
        ) : playing ? (
          <>
            <Pause className="mr-2 h-4 w-4" /> Stop
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" /> Play passage
          </>
        )}
      </Button>
      {playing && (
        <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
          {!progress ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="tabular-nums">
                {idx + 1}/{total}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
