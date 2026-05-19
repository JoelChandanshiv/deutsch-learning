import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, PencilLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="container py-16 md:py-24">
      <section className="mx-auto max-w-4xl text-center">
        <Badge variant="outline" className="mb-6 inline-flex items-center gap-1 border-primary/30 text-primary">
          <Sparkles className="h-3 w-3" /> A1 · A2 · B1 · B2 · C1
        </Badge>
        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          German practice that{" "}
          <span className="gradient-text">respects your intelligence.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          Structured drills, real readings, and AI conversation for serious
          learners from A1 to C1. Free. No ads. No owl.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/practice">
              Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-base">
            <Link href="/progress">See progress dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-5xl gap-6 md:grid-cols-3">
        <FeatureCard
          icon={<PencilLine className="h-5 w-5" />}
          title="Translation Drills"
          description="Translate prompts both ways. Instant grading with grammar notes from a real language model."
        />
        <FeatureCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Reading with Click-Translate"
          description="Read real German passages. Tap any word for meaning, gender, and an example sentence — instantly."
        />
        <FeatureCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="AI Conversation"
          description="Chat in German at your level. Pick a scenario. Get gentle corrections when you slip up."
        />
      </section>

      <section className="mx-auto mt-24 max-w-4xl">
        <h2 className="text-balance text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Why DeutschPath
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <ReasonCard
            heading="Anti-Duolingo"
            body="No cartoonish characters. No fake gamification. Just practice that adds up."
          />
          <ReasonCard
            heading="CEFR-aligned"
            body="Content is organized by real European framework levels — not arbitrary 'leagues'."
          />
          <ReasonCard
            heading="Progress that sticks"
            body="Streaks, XP, and a vocabulary list saved in your browser. No login needed."
          />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-3xl rounded-2xl border border-border/60 bg-card p-8 text-center md:p-12">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Ready to practice today?
        </h2>
        <p className="mt-3 text-muted-foreground">
          One session is enough to start a streak. Begin with translation drills
          at A1.
        </p>
        <Button asChild size="lg" className="mt-6 text-base">
          <Link href="/practice">
            Start <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border/60 transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="font-display text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ReasonCard({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-6">
      <h3 className="font-display text-lg font-semibold">{heading}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
