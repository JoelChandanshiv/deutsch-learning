import { NextResponse } from "next/server";
import { extractJSON, getGeminiClient, MODELS } from "@/lib/llm";

export const runtime = "nodejs";

type GradeRequest = {
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  alternatives?: string[];
  level?: string;
  direction?: "en-to-de" | "de-to-en";
};

type GradeResponse = {
  status: "correct" | "close" | "incorrect";
  feedback: string;
  correctedAnswer?: string;
  encouragement?: string;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { value: GradeResponse; expires: number }>();

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,!?;:"'„""''»«()\[\]{}-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cacheKey(req: GradeRequest): string {
  return `${normalize(req.prompt)}|${normalize(req.userAnswer)}`;
}

export async function POST(req: Request) {
  let body: GradeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.prompt || !body.userAnswer || !body.correctAnswer) {
    return NextResponse.json(
      { error: "prompt, userAnswer and correctAnswer are required" },
      { status: 400 },
    );
  }

  const userNorm = normalize(body.userAnswer);
  if (!userNorm) {
    return NextResponse.json<GradeResponse>({
      status: "incorrect",
      feedback: "You didn't type anything. Give it a try!",
      correctedAnswer: body.correctAnswer,
    });
  }

  const correctNorm = normalize(body.correctAnswer);
  const altsNorm = (body.alternatives ?? []).map(normalize);
  if (userNorm === correctNorm || altsNorm.includes(userNorm)) {
    return NextResponse.json<GradeResponse>({
      status: "correct",
      feedback: "Exact match — nicely done.",
      encouragement: "Genau richtig!",
    });
  }

  const key = cacheKey(body);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json<GradeResponse>(cached.value);
  }

  try {
    const client = getGeminiClient();
    const direction = body.direction ?? "en-to-de";
    const sourceLang = direction === "en-to-de" ? "English" : "German";
    const targetLang = direction === "en-to-de" ? "German" : "English";

    const systemInstruction = `You are a friendly German language teacher grading a student's translation. Be concise, accurate, and encouraging. Reply with JSON only — no markdown, no extra text.`;

    const userPrompt = `Source (${sourceLang}): "${body.prompt}"
Expected ${targetLang}: "${body.correctAnswer}"
Acceptable alternatives: ${body.alternatives && body.alternatives.length > 0 ? body.alternatives.map((a) => `"${a}"`).join(", ") : "(none)"}
Student wrote: "${body.userAnswer}"
Student level: ${body.level ?? "A1"}

Grade the student's answer. Mark "correct" if the meaning is right and grammar is essentially correct (minor casing/punctuation differences are fine). Mark "close" if there's a small grammar slip or one-word issue but the gist is clear. Mark "incorrect" if meaning is wrong or there are several major errors.

Output JSON in this exact shape:
{
  "status": "correct" | "close" | "incorrect",
  "feedback": "1-2 sentence explanation of what's right or wrong",
  "correctedAnswer": "the corrected version if status is close or incorrect, otherwise omit",
  "encouragement": "a brief friendly nudge in German or English"
}`;

    const model = client.getGenerativeModel({
      model: MODELS.grading,
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 400,
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsed = extractJSON<GradeResponse>(text);

    if (!parsed || !["correct", "close", "incorrect"].includes(parsed.status)) {
      return NextResponse.json<GradeResponse>({
        status: "incorrect",
        feedback: "We couldn't grade that automatically. The expected answer is shown.",
        correctedAnswer: body.correctAnswer,
      });
    }

    cache.set(key, { value: parsed, expires: Date.now() + CACHE_TTL_MS });
    return NextResponse.json<GradeResponse>(parsed);
  } catch (error) {
    console.error("Grade API error:", error);
    return NextResponse.json(
      {
        status: "incorrect",
        feedback:
          "Couldn't reach the grading service. Compare your answer with the expected one.",
        correctedAnswer: body.correctAnswer,
      } satisfies GradeResponse,
      { status: 200 },
    );
  }
}
