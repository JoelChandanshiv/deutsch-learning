import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-bold text-primary md:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
        Diese Seite gibt es nicht.
      </h1>
      <p className="mt-2 max-w-md text-balance text-muted-foreground">
        Sorry — that page wandered off. The good news: there&apos;s German to
        practice right here.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice">Start practicing</Link>
        </Button>
      </div>
    </div>
  );
}
