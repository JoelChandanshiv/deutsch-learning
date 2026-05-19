import { emitChange, getItem, setItem } from "./storage";

export type StreakState = {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  history: string[];
};

const STREAK_KEY = "streak";

const DEFAULT_STATE: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  history: [],
};

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStreak(): StreakState {
  return getItem<StreakState>(STREAK_KEY, DEFAULT_STATE);
}

export function recordActivity(): StreakState {
  const today = todayISO();
  const state = getStreak();

  if (state.lastActiveDate === today) {
    return state;
  }

  let newCurrent: number;
  if (state.lastActiveDate === null) {
    newCurrent = 1;
  } else {
    const gap = daysBetween(state.lastActiveDate, today);
    newCurrent = gap === 1 ? state.current + 1 : 1;
  }

  const history = state.history.includes(today)
    ? state.history
    : [...state.history, today].slice(-90);

  const next: StreakState = {
    current: newCurrent,
    longest: Math.max(state.longest, newCurrent),
    lastActiveDate: today,
    history,
  };
  setItem(STREAK_KEY, next);
  emitChange();
  return next;
}

export function isActiveOn(state: StreakState, isoDate: string): boolean {
  return state.history.includes(isoDate);
}
