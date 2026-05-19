import { emitChange, getItem, setItem } from "./storage";
import a1Packs from "@/content/vocabulary/a1.json";
import a2Packs from "@/content/vocabulary/a2.json";
import b1Packs from "@/content/vocabulary/b1.json";
import type { CEFRLevel } from "./xp";

export type VocabWord = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  gender?: "der" | "die" | "das" | null;
  example: string;
  exampleTranslation: string;
  whyItMatters?: string;
};

export type VocabPack = {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  icon: string;
  color: string;
  words: VocabWord[];
};

const map: Partial<Record<CEFRLevel, VocabPack[]>> = {
  A1: a1Packs as VocabPack[],
  A2: a2Packs as VocabPack[],
  B1: b1Packs as VocabPack[],
};

export function getPacks(level: CEFRLevel): VocabPack[] {
  return map[level] ?? [];
}

export function getAllPacks(): VocabPack[] {
  return [...(map.A1 ?? []), ...(map.A2 ?? []), ...(map.B1 ?? [])];
}

export function getPack(packId: string): VocabPack | undefined {
  return getAllPacks().find((p) => p.id === packId);
}

export const VOCAB_LEVELS: CEFRLevel[] = (["A1", "A2", "B1"] as CEFRLevel[]).filter(
  (lvl) => (map[lvl]?.length ?? 0) > 0,
);

// ----- Mastered tracking (localStorage) -----

const MASTERED_KEY = "vocab:mastered";
const CHALLENGE_KEY = "vocab:dailyChallenge";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'„""''»«()]/g, "").trim();
}

export function getMastered(): Set<string> {
  return new Set(getItem<string[]>(MASTERED_KEY, []));
}

export function isMastered(word: string): boolean {
  return getMastered().has(normalizeWord(word));
}

export function markMastered(word: string): void {
  const set = getMastered();
  set.add(normalizeWord(word));
  setItem(MASTERED_KEY, Array.from(set));
  emitChange();
}

export function unmarkMastered(word: string): void {
  const set = getMastered();
  set.delete(normalizeWord(word));
  setItem(MASTERED_KEY, Array.from(set));
  emitChange();
}

export function getMasteredCount(): number {
  return getMastered().size;
}

export function getPackProgress(pack: VocabPack): { mastered: number; total: number } {
  const set = getMastered();
  const total = pack.words.length;
  const mastered = pack.words.filter((w) => set.has(normalizeWord(w.word))).length;
  return { mastered, total };
}

// ----- Daily Challenge -----

export type DailyChallengeState = {
  date: string;
  level: CEFRLevel;
  wordKeys: string[];
  completed: boolean;
};

function pickRandomUnmastered(level: CEFRLevel, n: number): VocabWord[] {
  const mastered = getMastered();
  const all = getPacks(level).flatMap((p) => p.words);
  const candidates = all.filter((w) => !mastered.has(normalizeWord(w.word)));
  const pool = candidates.length >= n ? candidates : all;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

const DAILY_CHALLENGE_SIZE = 5;

export function getDailyChallenge(level: CEFRLevel): { words: VocabWord[]; completed: boolean } {
  const today = todayISO();
  const stored = getItem<DailyChallengeState | null>(CHALLENGE_KEY, null);
  if (stored && stored.date === today && stored.level === level) {
    const all = getPacks(level).flatMap((p) => p.words);
    const words = stored.wordKeys
      .map((k) => all.find((w) => normalizeWord(w.word) === k))
      .filter((w): w is VocabWord => Boolean(w));
    if (words.length > 0) {
      return { words, completed: stored.completed };
    }
  }
  const words = pickRandomUnmastered(level, DAILY_CHALLENGE_SIZE);
  const next: DailyChallengeState = {
    date: today,
    level,
    wordKeys: words.map((w) => normalizeWord(w.word)),
    completed: false,
  };
  setItem(CHALLENGE_KEY, next);
  return { words, completed: false };
}

export function markDailyChallengeComplete(level: CEFRLevel): void {
  const today = todayISO();
  const stored = getItem<DailyChallengeState | null>(CHALLENGE_KEY, null);
  if (!stored || stored.date !== today || stored.level !== level) return;
  setItem(CHALLENGE_KEY, { ...stored, completed: true });
  emitChange();
}

// ----- Word of the Day -----

/**
 * Deterministic for a given (level, date) pair so the user sees the
 * same featured word all day across reloads.
 */
export function getWordOfDay(level: CEFRLevel): VocabWord | null {
  const all = getPacks(level).flatMap((p) => p.words);
  if (all.length === 0) return null;
  const today = todayISO();
  // simple hash of date string + level
  let h = 0;
  for (const ch of today + level) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const idx = Math.abs(h) % all.length;
  return all[idx];
}
