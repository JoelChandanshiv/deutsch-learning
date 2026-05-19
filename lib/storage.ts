const NAMESPACE = "deutschpath:v1:";

function key(k: string): string {
  return `${NAMESPACE}${k}`;
}

export function getItem<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key(k));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(k: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(k), JSON.stringify(value));
  } catch {
    // storage full, private mode, etc — silently ignore
  }
}

export function removeItem(k: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(k));
  } catch {
    // ignore
  }
}

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitChange(): void {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith(NAMESPACE)) emitChange();
  });
}
