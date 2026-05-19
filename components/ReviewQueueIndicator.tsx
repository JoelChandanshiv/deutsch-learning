"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { getDueCount } from "@/lib/srs";
import { cn } from "@/lib/utils";

export function ReviewQueueIndicator({ className }: { className?: string }) {
  const due = useStore(getDueCount, 0);
  const active = due > 0;

  return (
    <Link
      href="/practice/review"
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
        className,
      )}
      title={
        active
          ? `${due} card${due === 1 ? "" : "s"} due for review`
          : "No cards due — add words from a reading"
      }
    >
      <Brain className="h-3.5 w-3.5" />
      <span className="tabular-nums">{due}</span>
      {active && (
        <span className="absolute -right-1 -top-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
    </Link>
  );
}
