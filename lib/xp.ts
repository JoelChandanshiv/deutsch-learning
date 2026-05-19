import { emitChange, getItem, setItem } from "./storage";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export const LEVELS: { level: CEFRLevel; threshold: number; label: string }[] = [
  { level: "A1", threshold: 0, label: "Beginner" },
  { level: "A2", threshold: 500, label: "Elementary" },
  { level: "B1", threshold: 2000, label: "Intermediate" },
  { level: "B2", threshold: 5000, label: "Upper Intermediate" },
  { level: "C1", threshold: 12000, label: "Advanced" },
];

const XP_KEY = "xp";
const SELECTED_LEVEL_KEY = "selectedLevel";

export const XP_REWARDS = {
  correctTranslation: 10,
  closeTranslation: 5,
  completeReading: 30,
  chatMessage: 5,
  lookUpWord: 1,
} as const;

export const DAILY_GOAL_XP = 50;

export type XPState = {
  total: number;
  level: CEFRLevel;
  progress: number;
  nextLevel: CEFRLevel | null;
  xpInLevel: number;
  xpForNextLevel: number;
  dailyXP: number;
  dailyDate: string | null;
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type RawXP = {
  total: number;
  dailyXP: number;
  dailyDate: string | null;
};

function computeLevel(total: number): {
  level: CEFRLevel;
  nextLevel: CEFRLevel | null;
  progress: number;
  xpInLevel: number;
  xpForNextLevel: number;
} {
  let currentIdx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (total >= LEVELS[i].threshold) currentIdx = i;
  }
  const current = LEVELS[currentIdx];
  const next = LEVELS[currentIdx + 1] ?? null;
  if (!next) {
    return {
      level: current.level,
      nextLevel: null,
      progress: 1,
      xpInLevel: total - current.threshold,
      xpForNextLevel: 0,
    };
  }
  const xpInLevel = total - current.threshold;
  const xpForNextLevel = next.threshold - current.threshold;
  return {
    level: current.level,
    nextLevel: next.level,
    progress: Math.min(1, xpInLevel / xpForNextLevel),
    xpInLevel,
    xpForNextLevel,
  };
}

function readRaw(): RawXP {
  return getItem<RawXP>(XP_KEY, { total: 0, dailyXP: 0, dailyDate: null });
}

function resetDailyIfNeeded(raw: RawXP): RawXP {
  const today = todayISO();
  if (raw.dailyDate !== today) {
    return { ...raw, dailyXP: 0, dailyDate: today };
  }
  return raw;
}

export function getXP(): XPState {
  const raw = resetDailyIfNeeded(readRaw());
  return { ...computeLevel(raw.total), total: raw.total, dailyXP: raw.dailyXP, dailyDate: raw.dailyDate };
}

export function addXP(amount: number): XPState {
  const raw = resetDailyIfNeeded(readRaw());
  const next: RawXP = {
    total: Math.max(0, raw.total + amount),
    dailyXP: Math.max(0, raw.dailyXP + amount),
    dailyDate: raw.dailyDate,
  };
  setItem(XP_KEY, next);
  emitChange();
  return { ...computeLevel(next.total), total: next.total, dailyXP: next.dailyXP, dailyDate: next.dailyDate };
}

export function getSelectedLevel(): CEFRLevel {
  return getItem<CEFRLevel>(SELECTED_LEVEL_KEY, "A1");
}

export function setSelectedLevel(level: CEFRLevel): void {
  setItem(SELECTED_LEVEL_KEY, level);
  emitChange();
}
