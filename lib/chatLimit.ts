import { emitChange, getItem, setItem } from "./storage";

const KEY = "chatLimit";
export const DAILY_CHAT_LIMIT = 50;

type Limit = {
  date: string;
  count: number;
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getChatLimit(): { used: number; remaining: number; date: string } {
  const raw = getItem<Limit>(KEY, { date: today(), count: 0 });
  const t = today();
  if (raw.date !== t) {
    return { used: 0, remaining: DAILY_CHAT_LIMIT, date: t };
  }
  return {
    used: raw.count,
    remaining: Math.max(0, DAILY_CHAT_LIMIT - raw.count),
    date: t,
  };
}

export function incrementChatLimit(): { used: number; remaining: number } {
  const t = today();
  const raw = getItem<Limit>(KEY, { date: t, count: 0 });
  const next = raw.date === t ? { date: t, count: raw.count + 1 } : { date: t, count: 1 };
  setItem(KEY, next);
  emitChange();
  return {
    used: next.count,
    remaining: Math.max(0, DAILY_CHAT_LIMIT - next.count),
  };
}
