import type { CEFRLevel } from "@/lib/xp";
import { cn } from "@/lib/utils";

const styles: Record<CEFRLevel, string> = {
  A1: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  A2: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  B1: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  B2: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  C1: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export function LevelBadge({ level, className }: { level: CEFRLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
        styles[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
