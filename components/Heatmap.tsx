"use client";

import { cn } from "@/lib/utils";

type Props = {
  days?: number;
  activeDates: Set<string>;
  className?: string;
};

function dateAt(daysAgo: number): { iso: string; date: Date } {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { iso, date: d };
}

export function Heatmap({ days = 30, activeDates, className }: Props) {
  const cells = Array.from({ length: days }, (_, i) => {
    const { iso, date } = dateAt(days - 1 - i);
    return {
      iso,
      label: date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      active: activeDates.has(iso),
    };
  });

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {cells.map((c) => (
        <div
          key={c.iso}
          className={cn(
            "h-6 w-6 rounded-md border border-border/40",
            c.active ? "bg-primary" : "bg-muted/40",
          )}
          title={`${c.label}${c.active ? " — practiced" : ""}`}
        />
      ))}
    </div>
  );
}
