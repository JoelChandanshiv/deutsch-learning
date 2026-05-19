"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  draftKey?: string;
  targetMin?: number;
  targetMax?: number;
  disabled?: boolean;
  placeholder?: string;
};

const SPECIAL_CHARS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

export function WritingPad({
  value,
  onChange,
  draftKey,
  targetMin,
  targetMax,
  disabled,
  placeholder,
}: Props) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load draft on mount
  React.useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(`deutschpath:v1:writing-draft:${draftKey}`);
      if (saved && !value) onChange(saved);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Auto-save draft every 10s
  React.useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    const id = setInterval(() => {
      try {
        window.localStorage.setItem(`deutschpath:v1:writing-draft:${draftKey}`, value);
      } catch {
        /* ignore */
      }
    }, 10000);
    return () => clearInterval(id);
  }, [value, draftKey]);

  function insertChar(char: string) {
    if (disabled) return;
    const el = textareaRef.current;
    if (!el) {
      onChange(value + char);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onChange(next);
    // restore caret after the inserted char
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  }

  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
  const inRange = targetMin && targetMax ? wordCount >= targetMin && wordCount <= targetMax : true;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Insert:</span>
        {SPECIAL_CHARS.map((c) => (
          <Button
            key={c}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => insertChar(c)}
            disabled={disabled}
            className="h-7 w-9 font-display text-base font-medium"
          >
            {c}
          </Button>
        ))}
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Schreib auf Deutsch…"}
        rows={10}
        disabled={disabled}
        className="resize-y text-base leading-relaxed"
      />

      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            "tabular-nums",
            inRange ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400",
          )}
        >
          {wordCount} word{wordCount === 1 ? "" : "s"}
          {targetMin && targetMax && (
            <span className="ml-1 text-muted-foreground">
              · target {targetMin}–{targetMax}
            </span>
          )}
        </span>
        {draftKey && (
          <span className="text-[10px] text-muted-foreground">
            Auto-saved locally
          </span>
        )}
      </div>
    </div>
  );
}
