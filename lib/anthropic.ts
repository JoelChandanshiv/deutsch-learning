import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local (or your Vercel env vars).",
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const MODELS = {
  conversation: process.env.CLAUDE_MODEL_CONVERSATION ?? "claude-sonnet-4-5-20250929",
  grading: process.env.CLAUDE_MODEL_GRADING ?? "claude-haiku-4-5-20251001",
};

/**
 * Pull the first JSON object out of a model response, tolerant of code fences
 * and surrounding prose.
 */
export function extractJSON<T>(text: string): T | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
