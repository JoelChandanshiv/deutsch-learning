"use client";

import * as React from "react";
import type { VocabularyEntry } from "@/lib/content";
import { WordPopover } from "@/components/WordPopover";

type Props = {
  text: string;
  vocabulary?: VocabularyEntry[];
  sourceId?: string;
};

type Token = {
  text: string;
  isWord: boolean;
};

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*)|([^A-Za-zÄÖÜäöüß]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) tokens.push({ text: m[1], isWord: true });
    else if (m[2]) tokens.push({ text: m[2], isWord: false });
  }
  return tokens;
}

function findSentence(text: string, wordIndex: number): string {
  const left = text.lastIndexOf(".", wordIndex - 1);
  const right = text.indexOf(".", wordIndex);
  const start = left === -1 ? 0 : left + 1;
  const end = right === -1 ? text.length : right + 1;
  return text.slice(start, end).trim();
}

export function ReadingPassage({ text, vocabulary, sourceId }: Props) {
  const tokens = React.useMemo(() => tokenize(text), [text]);

  const vocabMap = React.useMemo(() => {
    const map = new Map<string, VocabularyEntry>();
    for (const v of vocabulary ?? []) {
      const key = v.word.replace(/^(der|die|das)\s+/i, "").toLowerCase();
      map.set(key, v);
    }
    return map;
  }, [vocabulary]);

  let wordOffset = 0;

  return (
    <p className="text-lg leading-relaxed md:text-xl md:leading-relaxed font-serif">
      {tokens.map((token, idx) => {
        if (!token.isWord) {
          return <span key={idx}>{token.text}</span>;
        }
        const localOffset = wordOffset;
        wordOffset += token.text.length;
        const context = findSentence(text, text.indexOf(token.text, localOffset));
        const vocab = vocabMap.get(token.text.toLowerCase());
        return (
          <WordPopover
            key={idx}
            word={token.text}
            context={context}
            vocab={vocab}
            source={sourceId}
          >
            <span
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-sm border-b border-dashed border-transparent transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
            >
              {token.text}
            </span>
          </WordPopover>
        );
      })}
    </p>
  );
}
