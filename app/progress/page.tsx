"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Brain, Flame, MessageCircle, PencilLine, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/LevelBadge";
import { Heatmap } from "@/components/Heatmap";
import { useStore } from "@/lib/useStore";
import { getStreak } from "@/lib/streaks";
import { getXP, DAILY_GOAL_XP } from "@/lib/xp";
import { getVocabulary, removeWord, type SavedWord } from "@/lib/vocabulary";
import { getChatLimit, DAILY_CHAT_LIMIT } from "@/lib/chatLimit";
import { getStats as getSRSStats } from "@/lib/srs";

const FALLBACK_STREAK = { current: 0, longest: 0, lastActiveDate: null, history: [] as string[] };
const FALLBACK_XP = {
  total: 0,
  level: "A1" as const,
  nextLevel: "A2" as const,
  progress: 0,
  xpInLevel: 0,
  xpForNextLevel: 500,
  dailyXP: 0,
  dailyDate: null as string | null,
};

const FALLBACK_SRS = {
  total: 0,
  dueToday: 0,
  reviewedToday: 0,
  reviewedLast7Days: 0,
  retentionLast7Days: 0,
  averageInterval: 0,
  dueInNext7Days: [0, 0, 0, 0, 0, 0, 0],
};

export default function ProgressPage() {
  const streak = useStore(getStreak, FALLBACK_STREAK);
  const xp = useStore(getXP, FALLBACK_XP);
  const vocab = useStore<SavedWord[]>(getVocabulary, []);
  const chat = useStore(getChatLimit, { used: 0, remaining: DAILY_CHAT_LIMIT, date: "" });
  const srs = useStore(getSRSStats, FALLBACK_SRS);
  const [vocabOpen, setVocabOpen] = React.useState(false);

  const activeDates = React.useMemo(() => new Set(streak.history ?? []), [streak.history]);
  const dailyProgress = Math.min(100, Math.round((xp.dailyXP / DAILY_GOAL_XP) * 100));
  const dailyGoalHit = xp.dailyXP >= DAILY_GOAL_XP;

  function handleRemove(word: string) {
    removeWord(word);
  }

  return (
    <div className="container max-w-5xl py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Progress
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your stats so far. All data is stored privately in your browser.
          </p>
        </div>
        <Button asChild>
          <Link href="/practice">
            Keep practicing <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" /> Current streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-4xl font-bold">{streak.current}</div>
            <p className="text-xs text-muted-foreground">
              {streak.current === 0
                ? "Practice today to start one."
                : `Longest streak: ${streak.longest} day${streak.longest === 1 ? "" : "s"}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Award className="h-4 w-4 text-primary" /> XP + Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-4xl font-bold">{xp.total}</div>
                <p className="text-xs text-muted-foreground">XP total</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <LevelBadge level={xp.level} />
                {xp.nextLevel && (
                  <span className="text-xs text-muted-foreground">
                    {xp.xpForNextLevel - xp.xpInLevel} XP to {xp.nextLevel}
                  </span>
                )}
              </div>
            </div>
            <Progress
              value={xp.nextLevel ? Math.round(xp.progress * 100) : 100}
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" /> Daily goal · {DAILY_GOAL_XP} XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-2xl font-bold">
                  {xp.dailyXP} / {DAILY_GOAL_XP} XP
                </div>
                <p className="text-xs text-muted-foreground">
                  {dailyGoalHit ? "Goal hit — great job today!" : "Keep going."}
                </p>
              </div>
              {dailyGoalHit && <Badge className="bg-emerald-500 hover:bg-emerald-500">Done</Badge>}
            </div>
            <Progress value={dailyProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" /> Spaced repetition
            </span>
            {srs.dueToday > 0 ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/practice/review">
                  Review {srs.dueToday} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">All caught up</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SRSStat label="Total cards" value={srs.total} />
            <SRSStat label="Due today" value={srs.dueToday} highlight={srs.dueToday > 0} />
            <SRSStat
              label="7-day retention"
              value={srs.reviewedLast7Days > 0 ? `${Math.round(srs.retentionLast7Days * 100)}%` : "—"}
            />
            <SRSStat
              label="Avg interval"
              value={srs.averageInterval > 0 ? `${srs.averageInterval}d` : "—"}
            />
          </div>
          {srs.total > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Next 7 days
              </p>
              <div className="mt-2 flex items-end gap-1.5">
                {srs.dueInNext7Days.map((n, i) => {
                  const max = Math.max(1, ...srs.dueInNext7Days);
                  const h = Math.max(4, Math.round((n / max) * 56));
                  return (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1"
                      title={`${n} card${n === 1 ? "" : "s"} due`}
                    >
                      <div
                        className={
                          "w-full rounded-sm " +
                          (n === 0 ? "bg-muted/40" : i === 0 ? "bg-primary" : "bg-primary/50")
                        }
                        style={{ height: h }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {i === 0 ? "Today" : `+${i}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatTile
          icon={<PencilLine className="h-4 w-4" />}
          label="Vocabulary"
          value={vocab.length}
          suffix="words"
        />
        <StatTile
          icon={<BookOpen className="h-4 w-4" />}
          label="Active days (last 30)"
          value={Array.from(activeDates).filter((d) => isWithin30Days(d)).length}
          suffix="days"
        />
        <StatTile
          icon={<MessageCircle className="h-4 w-4" />}
          label="Chat today"
          value={chat.used}
          suffix={`/ ${DAILY_CHAT_LIMIT}`}
        />
      </div>

      <Card className="mt-4 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base font-display">
            <span>Last 30 days</span>
            <span className="text-xs font-normal text-muted-foreground">
              Each square is a day; gold = practiced
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap activeDates={activeDates} />
        </CardContent>
      </Card>

      <Card className="mt-4 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-display">
            <span>Looked-up words ({vocab.length})</span>
            {vocab.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVocabOpen((v) => !v)}
              >
                {vocabOpen ? "Collapse" : "Expand"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vocab.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No words yet — try a{" "}
              <Link href="/practice/read" className="text-primary underline-offset-2 hover:underline">
                reading
              </Link>{" "}
              and tap any word.
            </p>
          ) : !vocabOpen ? (
            <p className="text-sm text-muted-foreground">
              {vocab.slice(0, 5).map((v) => v.word).join(", ")}
              {vocab.length > 5 && ` …and ${vocab.length - 5} more`}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {vocab.map((v) => (
                <li
                  key={v.word}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    {v.gender && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {v.gender}
                      </Badge>
                    )}
                    <span className="font-medium">{v.word}</span>
                    <span className="text-muted-foreground">{v.meaning}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(v.word)}
                    aria-label="Remove"
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SRSStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-md border p-3 " +
        (highlight ? "border-primary/40 bg-primary/5" : "border-border/40 bg-muted/40")
      }
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-1 font-display text-xl font-semibold " +
          (highlight ? "text-primary" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

function isWithin30Days(iso: string): boolean {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 30;
}

function StatTile({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
