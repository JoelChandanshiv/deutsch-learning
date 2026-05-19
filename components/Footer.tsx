import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 mt-16">
      <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>
          Built by{" "}
          <a
            href="https://github.com/JoelChandanshiv"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Joel Chandanshiv
          </a>
        </p>
        <a
          href="https://github.com/JoelChandanshiv/deutsch-learning"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 hover:text-foreground"
        >
          <Github className="h-4 w-4" />
          <span>Source</span>
        </a>
      </div>
    </footer>
  );
}
