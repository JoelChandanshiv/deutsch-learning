"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, cancel, isAvailable } from "@/lib/tts";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md";

const SIZE: Record<Size, { btn: string; icon: string }> = {
  xs: { btn: "h-6 w-6", icon: "h-3 w-3" },
  sm: { btn: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { btn: "h-9 w-9", icon: "h-4 w-4" },
};

type Props = {
  text: string;
  size?: Size;
  className?: string;
  rate?: number;
  label?: string;
};

export function AudioButton({
  text,
  size = "sm",
  className,
  rate,
  label = "Pronounce",
}: Props) {
  const [playing, setPlaying] = React.useState(false);
  const [available, setAvailable] = React.useState(true);

  React.useEffect(() => {
    setAvailable(isAvailable());
    return () => {
      if (playing) cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!text.trim()) return;
    if (playing) {
      cancel();
      setPlaying(false);
      return;
    }
    speak(text, {
      rate,
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }

  const dims = SIZE[size];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={!available}
      aria-label={label}
      title={available ? label : "Audio not supported in this browser"}
      className={cn(dims.btn, !available && "opacity-40", className)}
    >
      <Volume2
        className={cn(
          dims.icon,
          playing && "animate-pulse text-primary",
        )}
      />
    </Button>
  );
}
