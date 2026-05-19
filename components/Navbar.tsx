import Link from "next/link";
import { Languages } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StreakDisplay } from "@/components/StreakDisplay";
import { XPBar } from "@/components/XPBar";
import { DailyGoalRing } from "@/components/DailyGoalRing";
import { ReviewQueueIndicator } from "@/components/ReviewQueueIndicator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold shrink-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Languages className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">
            Deutsch<span className="text-primary">Path</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/practice"
            className="rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
          >
            Practice
          </Link>
          <Link
            href="/progress"
            className="rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
          >
            Progress
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <XPBar compact className="hidden md:flex" />
            <ReviewQueueIndicator className="hidden sm:inline-flex" />
            <DailyGoalRing className="hidden lg:inline-flex" />
            <StreakDisplay />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
