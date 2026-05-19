import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, PencilLine } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modes = [
  {
    href: "/practice/translate",
    icon: PencilLine,
    title: "Translation Drills",
    description: "Translate prompts both ways with instant AI grading.",
    cta: "Start drills",
  },
  {
    href: "/practice/read",
    icon: BookOpen,
    title: "Reading",
    description: "Real passages. Click any word for meaning.",
    cta: "Open library",
  },
  {
    href: "/practice/chat",
    icon: MessageCircle,
    title: "AI Conversation",
    description: "Chat in German at your level. Gentle corrections.",
    cta: "Start chatting",
  },
];

export default function PracticeIndex() {
  return (
    <div className="container py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Choose your practice mode
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Three ways to practice today. Pick whatever you have time for.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {modes.map((m) => (
          <Link key={m.href} href={m.href} className="group">
            <Card className="h-full border-border/60 transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-xl">{m.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {m.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {m.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
