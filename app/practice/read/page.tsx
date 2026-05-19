"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { getReadings, LEVELS_WITH_CONTENT } from "@/lib/content";
import { useStore } from "@/lib/useStore";
import { getSelectedLevel, type CEFRLevel } from "@/lib/xp";
import { LevelSelector } from "@/components/LevelSelector";
import { LevelBadge } from "@/components/LevelBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export default function ReadingListPage() {
  const level = useStore<CEFRLevel>(getSelectedLevel, "A1");
  const readings = getReadings(level);

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-1 h-4 w-4" /> Modes
          </Link>
        </Button>
        <LevelSelector enabledLevels={LEVELS_WITH_CONTENT} />
      </div>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Reading library
        </h1>
        <p className="mt-2 text-muted-foreground">
          Click any word in a passage to instantly see meaning, gender, and an
          example sentence.
        </p>
      </header>

      {readings.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
          No readings yet for {level}. Try A1 or A2.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {readings.map((r) => {
            const wc = wordCount(r.passage);
            const minutes = Math.max(1, Math.round(wc / 100));
            return (
              <Link key={r.id} href={`/practice/read/${r.id}`} className="group">
                <Card className="h-full border-border/60 transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <LevelBadge level={r.level} />
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {minutes} min · {wc} words
                      </span>
                    </div>
                    <CardTitle className="font-display text-xl group-hover:text-primary">
                      {r.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 leading-relaxed">
                      {r.passage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      <BookOpen className="h-3.5 w-3.5" /> Read
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
