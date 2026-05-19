import a2WritingPrompts from "@/content/writing-prompts/a2.json";
import b1WritingPrompts from "@/content/writing-prompts/b1.json";
import type { CEFRLevel } from "./xp";

export type WritingPrompt = {
  id: string;
  level: CEFRLevel;
  topic: string;
  prompt: string;
  suggestedLength: [number, number];
  hints: string[];
};

const map: Partial<Record<CEFRLevel, WritingPrompt[]>> = {
  A2: a2WritingPrompts as WritingPrompt[],
  B1: b1WritingPrompts as WritingPrompt[],
};

export function getWritingPrompts(level: CEFRLevel): WritingPrompt[] {
  return map[level] ?? [];
}

export const WRITING_LEVELS: CEFRLevel[] = (["A1", "A2", "B1", "B2", "C1"] as CEFRLevel[]).filter(
  (lvl) => (map[lvl]?.length ?? 0) > 0,
);
