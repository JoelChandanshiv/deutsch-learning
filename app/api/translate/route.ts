import { NextResponse } from "next/server";
import { extractJSON, getGeminiClient, MODELS } from "@/lib/llm";

export const runtime = "nodejs";

type TranslateRequest = {
  word: string;
  context?: string;
};

export type WordTranslation = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  gender: "der" | "die" | "das" | null;
  example: string;
  exampleTranslation: string;
};

const cache = new Map<string, WordTranslation>();

function key(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'„""''»«()]/g, "").trim();
}

export async function POST(req: Request) {
  let body: TranslateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.word || !body.word.trim()) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const k = key(body.word);
  if (cache.has(k)) {
    return NextResponse.json(cache.get(k));
  }

  try {
    const client = getGeminiClient();
    const systemInstruction = `You are a precise German-to-English translation engine. Reply with JSON only — no markdown, no extra text.`;

    const userPrompt = `Translate this German word: "${body.word}"
${body.context ? `Context (sentence it appears in): "${body.context}"` : ""}

Output JSON in this exact shape:
{
  "word": "${body.word}",
  "meaning": "primary English meaning(s) — comma-separated if multiple",
  "partOfSpeech": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | article | other",
  "gender": "der" | "die" | "das" | null,
  "example": "a simple natural German sentence using this word",
  "exampleTranslation": "the English translation of that sentence"
}

Set "gender" to null when it's not a noun. If the word is a conjugated verb form, mention the infinitive in the meaning.`;

    const model = client.getGenerativeModel({
      model: MODELS.grading,
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 350,
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsed = extractJSON<WordTranslation>(text);

    if (!parsed || !parsed.meaning) {
      return NextResponse.json<WordTranslation>({
        word: body.word,
        meaning: "(no translation available)",
        partOfSpeech: "other",
        gender: null,
        example: "",
        exampleTranslation: "",
      });
    }

    cache.set(k, parsed);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Translate API error:", error);
    return NextResponse.json<WordTranslation>(
      {
        word: body.word,
        meaning: "(translation service unavailable)",
        partOfSpeech: "other",
        gender: null,
        example: "",
        exampleTranslation: "",
      },
      { status: 200 },
    );
  }
}
