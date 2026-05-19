"use client";

import { LEVELS, type CEFRLevel, getSelectedLevel, setSelectedLevel } from "@/lib/xp";
import { useStore } from "@/lib/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LevelSelector({
  className,
  onChange,
  enabledLevels,
}: {
  className?: string;
  onChange?: (level: CEFRLevel) => void;
  enabledLevels?: CEFRLevel[];
}) {
  const selected = useStore<CEFRLevel>(getSelectedLevel, "A1");

  const handle = (level: CEFRLevel) => {
    setSelectedLevel(level);
    onChange?.(level);
  };

  return (
    <div className={cn("inline-flex rounded-lg border border-border bg-card p-1", className)}>
      {LEVELS.map(({ level }) => {
        const enabled = enabledLevels ? enabledLevels.includes(level) : true;
        const active = selected === level;
        return (
          <Button
            key={level}
            size="sm"
            variant={active ? "default" : "ghost"}
            onClick={() => handle(level)}
            disabled={!enabled}
            className={cn("h-8 w-12 text-xs font-semibold", !enabled && "opacity-40")}
            title={enabled ? `Switch to ${level}` : `${level} content coming soon`}
          >
            {level}
          </Button>
        );
      })}
    </div>
  );
}
