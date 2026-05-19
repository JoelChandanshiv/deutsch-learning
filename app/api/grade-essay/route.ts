import { NextResponse } from "next/server";
import { SchemaType } from "@google/generative-ai";
import { extractJSON, getGeminiClient, MODELS } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

type GradeEssayRequest = {
  prompt: string;
  essay: string;
  level?: string;
};

export type EssayFeedback = {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  structureScore: number;
  coherenceScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  betterPhrasings: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
};

export async function POST(req: Request) {
  let body: GradeEssayRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.prompt || !body.essay || !body.essay.trim()) {
    return NextResponse.json(
      { error: "prompt and essay are required" },
      { status: 400 },
    );
  }

  if (body.essay.length > 5000) {
    return NextResponse.json(
      { error: "Essay too long (max 5000 chars)" },
      { status: 400 },
    );
  }

  try {
    const client = getGeminiClient();
    const level = body.level ?? "A2";

    const systemInstruction = `You are a meticulous, friendly German language teacher grading a short essay at CEFR level ${level}. Be specific, accurate, and encouraging. Reply with valid JSON only.`;

    const userPrompt = `The student was asked to write on this prompt (in German):

PROMPT: "${body.prompt}"

Their essay (CEFR level: ${level}):
"""
${body.essay}
"""

Grade the essay on these criteria, each on a 0-10 scale:
- grammarScore: correctness of grammar (cases, agreement, verb conjugation, word order)
- vocabularyScore: range, appropriateness, and accuracy of vocabulary for the level
- structureScore: how well the essay addresses the prompt and is organized
- coherenceScore: how well sentences and paragraphs connect

overallScore should be a weighted average favoring grammar + structure.

Provide:
- 2-3 sentences of overall summary
- 2-4 specific strengths (real things the student did well)
- 2-4 specific improvements (actionable, not vague)
- Up to 6 corrections (most important first): for each, give the original incorrect phrase, the corrected version, and a 1-sentence explanation in English
- Up to 4 better phrasings: native-speaker improvements that aren't strictly errors but would sound more natural

Scoring guideline at ${level}:
- A2 essays: don't penalize Konjunktiv II avoidance or simple grammar — reward clarity and task completion
- B1 essays: expect varied connectors, some Konjunktiv II, more nuanced vocabulary

Output JSON matching the provided schema.`;

    const model = client.getGenerativeModel({
      model: MODELS.conversation,
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            overallScore: { type: SchemaType.NUMBER },
            grammarScore: { type: SchemaType.NUMBER },
            vocabularyScore: { type: SchemaType.NUMBER },
            structureScore: { type: SchemaType.NUMBER },
            coherenceScore: { type: SchemaType.NUMBER },
            summary: { type: SchemaType.STRING },
            strengths: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            improvements: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            corrections: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  original: { type: SchemaType.STRING },
                  corrected: { type: SchemaType.STRING },
                  explanation: { type: SchemaType.STRING },
                },
                required: ["original", "corrected", "explanation"],
              },
            },
            betterPhrasings: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  original: { type: SchemaType.STRING },
                  improved: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                },
                required: ["original", "improved", "reason"],
              },
            },
          },
          required: [
            "overallScore",
            "grammarScore",
            "vocabularyScore",
            "structureScore",
            "coherenceScore",
            "summary",
            "strengths",
            "improvements",
            "corrections",
          ],
        },
        maxOutputTokens: 4000,
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsed = extractJSON<EssayFeedback>(text);

    if (!parsed || typeof parsed.overallScore !== "number") {
      console.error("grade-essay: invalid model output:", text);
      return NextResponse.json(
        { error: "Could not grade the essay. Please try again." },
        { status: 502 },
      );
    }

    // Clamp scores to [0, 10] in case the model overshoots
    const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));
    parsed.overallScore = clamp(parsed.overallScore);
    parsed.grammarScore = clamp(parsed.grammarScore);
    parsed.vocabularyScore = clamp(parsed.vocabularyScore);
    parsed.structureScore = clamp(parsed.structureScore);
    parsed.coherenceScore = clamp(parsed.coherenceScore);
    parsed.betterPhrasings = parsed.betterPhrasings ?? [];

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("grade-essay error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Grading service unavailable" },
      { status: 500 },
    );
  }
}
