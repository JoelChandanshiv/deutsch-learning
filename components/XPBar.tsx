"use client";

import { getXP } from "@/lib/xp";
import { useStore } from "@/lib/useStore";
import { Progress } from "@/components/ui/progress";
import { LevelBadge } from "@/components/LevelBadge";
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

export function XPBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const xp = useStore(getXP, FALLBACK);
  const remaining = xp.nextLevel ? xp.xpForNextLevel - xp.xpInLevel : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <LevelBadge level={xp.level} />
        <span className="text-xs font-medium text-muted-foreground">{xp.total} XP</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <LevelBadge level={xp.level} />
          <span className="font-medium">{xp.total} XP</span>
        </div>
        {xp.nextLevel ? (
          <span className="text-xs text-muted-foreground">
            {remaining} XP to {xp.nextLevel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Top level reached</span>
        )}
      </div>
      <Progress value={Math.round(xp.progress * 100)} className="h-2" />
    </div>
  );
}
