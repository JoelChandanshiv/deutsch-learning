import type { CEFRLevel } from "./xp";

import a1Translations from "@/content/translations/a1.json";
import a2Translations from "@/content/translations/a2.json";
import a1Readings from "@/content/readings/a1.json";
import a2Readings from "@/content/readings/a2.json";
import a1GrammarTopics from "@/content/grammar/a1-topics.json";

export type TranslationDirection = "en-to-de" | "de-to-en";

export type TranslationDrill = {
  id: string;
  level: CEFRLevel;
  topic: string;
  direction: TranslationDirection;
  prompt: string;
  answer: string;
  alternatives: string[];
  hint: string;
  grammarNote: string;
};

export type WordType =
  | "noun-masculine"
  | "noun-feminine"
  | "noun-neuter"
  | "noun-plural"
  | "verb"
  | "verb-separable"
  | "verb-reflexive"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "other";

export type VocabularyEntry = {
  word: string;
  meaning: string;
  type: WordType | string;
};

export type Reading = {
  id: string;
  level: CEFRLevel;
  title: string;
  passage: string;
  translation: string;
  vocabulary: VocabularyEntry[];
  comprehensionQuestions: { q: string; a: string }[];
};

export type GrammarTopic = {
  id: string;
  level: CEFRLevel;
  title: string;
  summary: string;
  examples: { de: string; en: string }[];
  tips: string[];
};

const translationMap: Partial<Record<CEFRLevel, TranslationDrill[]>> = {
  A1: a1Translations as TranslationDrill[],
  A2: a2Translations as TranslationDrill[],
};

const readingMap: Partial<Record<CEFRLevel, Reading[]>> = {
  A1: a1Readings as Reading[],
  A2: a2Readings as Reading[],
};

export function getTranslations(level: CEFRLevel): TranslationDrill[] {
  return translationMap[level] ?? [];
}

export function getReadings(level: CEFRLevel): Reading[] {
  return readingMap[level] ?? [];
}

export function getReading(id: string): Reading | undefined {
  return [...(readingMap.A1 ?? []), ...(readingMap.A2 ?? [])].find((r) => r.id === id);
}

export function getGrammarTopics(level: CEFRLevel): GrammarTopic[] {
  if (level === "A1") return a1GrammarTopics as GrammarTopic[];
  return [];
}

export const LEVELS_WITH_CONTENT: CEFRLevel[] = ["A1", "A2"];
