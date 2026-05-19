import { emitChange, getItem, setItem } from "./storage";

export type SavedWord = {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  gender?: "der" | "die" | "das" | null;
  example?: string;
  exampleTranslation?: string;
  source?: string;
  firstSeenAt: number;
  lookupCount: number;
};

const VOCAB_KEY = "vocabulary";

function readAll(): Record<string, SavedWord> {
  return getItem<Record<string, SavedWord>>(VOCAB_KEY, {});
}

function writeAll(map: Record<string, SavedWord>): void {
  setItem(VOCAB_KEY, map);
  emitChange();
}

function normalizeKey(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'„""''»«()]/g, "");
}

export function getVocabulary(): SavedWord[] {
  const map = readAll();
  return Object.values(map).sort((a, b) => b.firstSeenAt - a.firstSeenAt);
}

export function recordLookup(word: Omit<SavedWord, "firstSeenAt" | "lookupCount">): void {
  const key = normalizeKey(word.word);
  if (!key) return;
  const map = readAll();
  const existing = map[key];
  if (existing) {
    map[key] = { ...existing, lookupCount: existing.lookupCount + 1 };
  } else {
    map[key] = { ...word, firstSeenAt: Date.now(), lookupCount: 1 };
  }
  writeAll(map);
}

export function removeWord(word: string): void {
  const map = readAll();
  delete map[normalizeKey(word)];
  writeAll(map);
}
