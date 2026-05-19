import { emitChange, getItem, setItem } from "./storage";

export type ReviewQuality = 0 | 3 | 4 | 5;

export type ReviewCard = {
  id: string;
  word: string;
  meaning: string;
  gender?: "der" | "die" | "das" | null;
  partOfSpeech?: string;
  example?: string;
  exampleTranslation?: string;
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReviewed: string | null;
  createdAt: string;
};

export type ReviewLogEntry = {
  date: string;
  cardId: string;
  quality: ReviewQuality;
};

const CARDS_KEY = "srs:cards";
const LOG_KEY = "srs:log";
const LOG_MAX = 500;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysISO(days: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeId(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'„""''»«()]/g, "").trim();
}

function readCards(): Record<string, ReviewCard> {
  return getItem<Record<string, ReviewCard>>(CARDS_KEY, {});
}

function writeCards(map: Record<string, ReviewCard>): void {
  setItem(CARDS_KEY, map);
  emitChange();
}

function readLog(): ReviewLogEntry[] {
  return getItem<ReviewLogEntry[]>(LOG_KEY, []);
}

function appendLog(entry: ReviewLogEntry): void {
  const log = readLog();
  log.push(entry);
  setItem(LOG_KEY, log.slice(-LOG_MAX));
}

export function hasCard(word: string): boolean {
  return normalizeId(word) in readCards();
}

export function addWordToReview(input: {
  word: string;
  meaning: string;
  gender?: "der" | "die" | "das" | null;
  partOfSpeech?: string;
  example?: string;
  exampleTranslation?: string;
}): ReviewCard | null {
  const id = normalizeId(input.word);
  if (!id) return null;
  const map = readCards();
  if (map[id]) return map[id];
  const card: ReviewCard = {
    id,
    word: input.word,
    meaning: input.meaning,
    gender: input.gender ?? null,
    partOfSpeech: input.partOfSpeech,
    example: input.example,
    exampleTranslation: input.exampleTranslation,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: todayISO(),
    lastReviewed: null,
    createdAt: new Date().toISOString(),
  };
  map[id] = card;
  writeCards(map);
  return card;
}

export function removeCard(word: string): void {
  const map = readCards();
  delete map[normalizeId(word)];
  writeCards(map);
}

/**
 * SM-2 algorithm. Quality:
 *   0 = Again (forgot)
 *   3 = Hard
 *   4 = Good
 *   5 = Easy
 */
export function scheduleNextReview(card: ReviewCard, quality: ReviewQuality): ReviewCard {
  let { ease, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease);

    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease = Math.max(1.3, ease);
  }

  return {
    ...card,
    ease,
    interval,
    repetitions,
    nextReview: addDaysISO(interval),
    lastReviewed: todayISO(),
  };
}

export function recordReview(cardId: string, quality: ReviewQuality): ReviewCard | null {
  const map = readCards();
  const card = map[cardId];
  if (!card) return null;
  const updated = scheduleNextReview(card, quality);
  map[cardId] = updated;
  writeCards(map);
  appendLog({ date: todayISO(), cardId, quality });
  return updated;
}

export function getAllCards(): ReviewCard[] {
  return Object.values(readCards());
}

export function getDueCards(): ReviewCard[] {
  const today = todayISO();
  return getAllCards()
    .filter((c) => c.nextReview <= today)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
}

export function getDueCount(): number {
  return getDueCards().length;
}

export type SRSStats = {
  total: number;
  dueToday: number;
  reviewedToday: number;
  reviewedLast7Days: number;
  retentionLast7Days: number; // 0..1
  averageInterval: number;
  dueInNext7Days: number[];
};

export function getStats(): SRSStats {
  const cards = getAllCards();
  const log = readLog();
  const today = todayISO();

  const dueToday = cards.filter((c) => c.nextReview <= today).length;

  const reviewedToday = log.filter((l) => l.date === today).length;

  const last7Cutoff = addDaysISO(-7);
  const last7 = log.filter((l) => l.date >= last7Cutoff);
  const successes = last7.filter((l) => l.quality >= 4).length;
  const retentionLast7Days = last7.length > 0 ? successes / last7.length : 0;

  const intervals = cards.filter((c) => c.repetitions > 0).map((c) => c.interval);
  const averageInterval =
    intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : 0;

  const dueInNext7Days: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDaysISO(i);
    dueInNext7Days.push(cards.filter((c) => c.nextReview === d).length);
  }

  return {
    total: cards.length,
    dueToday,
    reviewedToday,
    reviewedLast7Days: last7.length,
    retentionLast7Days,
    averageInterval,
    dueInNext7Days,
  };
}
