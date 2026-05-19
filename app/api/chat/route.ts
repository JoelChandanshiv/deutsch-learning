import { getGeminiClient, MODELS } from "@/lib/llm";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  level?: string;
  topic?: string;
  messages: ChatMessage[];
};

const MAX_HISTORY = 10;

const TOPIC_PROMPTS: Record<string, string> = {
  free: "an open free-form conversation — pick any everyday topic that fits the student's interests",
  restaurant: "ordering food and drinks at a German restaurant — be the waiter/waitress",
  interview: "a friendly job interview in German — be the interviewer",
  day: "a casual chat about the student's day — ask about routines, work, free time",
  doctor: "a visit to a German doctor's office — be the doctor asking about symptoms",
};

function buildSystem(level: string, topic: string): string {
  const topicDesc = TOPIC_PROMPTS[topic] ?? TOPIC_PROMPTS.free;
  return `You are a friendly, patient German language tutor. The student is at CEFR level ${level}.

Rules:
- Respond ENTIRELY in German appropriate for ${level} level. Keep sentences short and clear at A1/A2; longer and more nuanced at B1+. Use only common vocabulary at A1/A2.
- The scenario is: ${topicDesc}. Stay on this topic unless the student steers elsewhere.
- If the student's last message contains German with errors, append a single line at the end like: "(Tipp: <one short correction or hint in English>)". One line, max. If their German is fine, do NOT add a Tipp.
- If the student writes in English, gently nudge them back to German but answer at least one of their questions in simple German first.
- Be encouraging, never condescending. Stay short — 2-4 sentences per turn.
- Begin or continue the conversation naturally.`;
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const level = body.level ?? "A1";
  const topic = body.topic ?? "free";

  const recent = body.messages.slice(-MAX_HISTORY);
  // Gemini expects role "model" for the assistant
  const contents = recent.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let client;
  try {
    client = getGeminiClient();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Gemini client unavailable",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const model = client.getGenerativeModel({
    model: MODELS.conversation,
    systemInstruction: buildSystem(level, topic),
    generationConfig: {
      maxOutputTokens: 600,
      temperature: 0.7,
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream({ contents });
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-store",
      "x-accel-buffering": "no",
    },
  });
}
