import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local (or your Vercel env vars).",
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export const MODELS = {
  conversation: process.env.GEMINI_MODEL_CONVERSATION ?? "gemini-2.5-flash",
  grading: process.env.GEMINI_MODEL_GRADING ?? "gemini-2.5-flash",
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
