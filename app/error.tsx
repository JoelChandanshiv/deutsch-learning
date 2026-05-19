"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Etwas ist schiefgelaufen.
      </h1>
      <p className="mt-2 max-w-md text-balance text-muted-foreground">
        Something went wrong. Try again, or head back home.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
