"use client";

import { Flame } from "lucide-react";
import { getStreak } from "@/lib/streaks";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";

export function StreakDisplay({ className }: { className?: string }) {
  const streak = useStore(getStreak, { current: 0, longest: 0, lastActiveDate: null, history: [] });
  const active = streak.current > 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
      title={
        streak.current > 0
          ? `${streak.current}-day streak — keep it going!`
          : "Practice today to start a streak"
      }
    >
      <Flame className={cn("h-3.5 w-3.5", active && "fill-orange-500/30")} />
      <span>{streak.current}</span>
    </div>
  );
}
