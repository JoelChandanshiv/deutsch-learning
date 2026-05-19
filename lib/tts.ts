"use client";

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
};

let voicesCache: SpeechSynthesisVoice[] | null = null;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeQueue: SpeechSynthesisUtterance[] | null = null;

export function isAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isAvailable()) return Promise.resolve([]);
  if (voicesCache && voicesCache.length > 0) return Promise.resolve(voicesCache);
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const initial = synth.getVoices();
    if (initial.length > 0) {
      voicesCache = initial;
      resolve(initial);
      return;
    }
    const handler = () => {
      const v = synth.getVoices();
      if (v.length > 0) {
        voicesCache = v;
        synth.removeEventListener("voiceschanged", handler);
        resolve(v);
      }
    };
    synth.addEventListener("voiceschanged", handler);
    setTimeout(() => {
      const v = synth.getVoices();
      voicesCache = v;
      synth.removeEventListener("voiceschanged", handler);
      resolve(v);
    }, 1500);
  });
  return voicesPromise;
}

export async function getGermanVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  if (voices.length === 0) return null;
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  if (german.length === 0) return null;
  return (
    german.find((v) => v.lang === "de-DE") ??
    german.find((v) => v.lang.toLowerCase() === "de") ??
    german[0]
  );
}

let warnedNoVoice = false;

export async function hasGermanVoice(): Promise<boolean> {
  if (!isAvailable()) return false;
  const v = await getGermanVoice();
  if (!v && !warnedNoVoice) {
    warnedNoVoice = true;
    console.warn(
      "[tts] No German voice installed in this browser. Audio will fall back to the default voice.",
    );
  }
  return v !== null;
}

export function cancel(): void {
  if (!isAvailable()) return;
  activeQueue = null;
  activeUtterance = null;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isAvailable() || !text.trim()) {
    opts.onError?.(new Error("Speech synthesis unavailable"));
    return;
  }

  cancel();

  try {
    const voice = await getGermanVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang ?? "de-DE";
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1.0;
    u.onstart = () => opts.onStart?.();
    u.onend = () => {
      if (activeUtterance === u) activeUtterance = null;
      opts.onEnd?.();
    };
    u.onerror = (e) => {
      if (activeUtterance === u) activeUtterance = null;
      // 'interrupted' / 'canceled' are normal user-initiated stops; ignore them
      const err = e as SpeechSynthesisErrorEvent;
      if (err.error === "interrupted" || err.error === "canceled") {
        opts.onEnd?.();
        return;
      }
      opts.onError?.(new Error(err.error || "speech error"));
    };
    activeUtterance = u;
    window.speechSynthesis.speak(u);
  } catch (err) {
    opts.onError?.(err instanceof Error ? err : new Error("unknown tts error"));
  }
}

/**
 * Split text on sentence boundaries (.!?) keeping the punctuation,
 * filtering empty fragments.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export type PassageProgress = {
  sentenceIndex: number;
  totalSentences: number;
  sentence: string;
};

export async function speakPassage(
  text: string,
  opts: SpeakOptions & {
    onSentence?: (p: PassageProgress) => void;
  } = {},
): Promise<void> {
  if (!isAvailable() || !text.trim()) {
    opts.onError?.(new Error("Speech synthesis unavailable"));
    return;
  }

  cancel();

  const sentences = splitSentences(text);
  if (sentences.length === 0) return;

  const voice = await getGermanVoice();
  const queue: SpeechSynthesisUtterance[] = sentences.map((sentence) => {
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = voice?.lang ?? "de-DE";
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1.0;
    return u;
  });
  activeQueue = queue;

  opts.onStart?.();

  for (let i = 0; i < queue.length; i++) {
    if (activeQueue !== queue) return; // cancelled
    const u = queue[i];
    opts.onSentence?.({
      sentenceIndex: i,
      totalSentences: queue.length,
      sentence: sentences[i],
    });
    await new Promise<void>((resolve) => {
      u.onend = () => resolve();
      u.onerror = (e) => {
        const err = e as SpeechSynthesisErrorEvent;
        if (err.error && err.error !== "interrupted" && err.error !== "canceled") {
          opts.onError?.(new Error(err.error));
        }
        resolve();
      };
      window.speechSynthesis.speak(u);
    });
    if (activeQueue !== queue) return;
  }

  activeQueue = null;
  opts.onEnd?.();
}
