"use client";

import { useStore } from "@/lib/useStore";
import { DAILY_GOAL_XP, getXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

const FALLBACK = {
  total: 0,
  level: "A1" as const,
  nextLevel: "A2" as const,
  progress: 0,
  xpInLevel: 0,
  xpForNextLevel: 500,
  dailyXP: 0,
  dailyDate: null,
};

export function DailyGoalRing({ className }: { className?: string }) {
  const xp = useStore(getXP, FALLBACK);
  const pct = Math.min(100, Math.round((xp.dailyXP / DAILY_GOAL_XP) * 100));
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const done = xp.dailyXP >= DAILY_GOAL_XP;

  return (
    <div
      className={cn("relative inline-flex h-7 w-7 items-center justify-center", className)}
      title={`Daily goal: ${xp.dailyXP}/${DAILY_GOAL_XP} XP${done ? " — done!" : ""}`}
    >
      <svg width={24} height={24} viewBox="0 0 24 24" className="rotate-[-90deg]">
        <circle
          cx={12}
          cy={12}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={2.5}
        />
        <circle
          cx={12}
          cy={12}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="absolute text-[9px] font-semibold tabular-nums">
        {done ? "✓" : Math.min(99, Math.round((xp.dailyXP / DAILY_GOAL_XP) * 100))}
      </span>
    </div>
  );
}
