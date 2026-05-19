# DeutschPath

> Practice German from A1 to C1 — instant translation, AI conversation, and progress that sticks.

DeutschPath is a structured, recruiter-demoable German practice app with three modes (translation drills, click-to-translate readings, and AI conversation), CEFR-aligned content, and a local-only progress tracker.

**Live demo:** [deutsch-easy.vercel.app](https://deutsch-easy.vercel.app/)

---

## Features

| Mode | What it does |
| --- | --- |
| **Translation Drills** | Translate prompts both ways (en↔de). Instant grading by Gemini with grammar notes and an exact-match short-circuit so common answers never hit the API. |
| **Reading with Click-Translate** | Real German passages — click *any* word for meaning, gender, and a generated example sentence. Passage-level audio playback with per-sentence progress. Aggressive in-memory caching means repeat clicks are instant. |
| **AI Conversation** | Stream a chat with Gemini in German at your CEFR level. Pick a scenario (restaurant, job interview, day, doctor, or free chat). Subtle `(Tipp: …)` corrections appear after grammar slips. |
| **🆕 Listening (dictation)** | Audio plays a German sentence; type what you hear. LCS-based word diff with color-coded inline corrections. Play, repeat, slow-down (0.65×), or reveal the transcript. |
| **🆕 Writing practice** | Pick a prompt at A2 or B1, write a short essay in German, get scored 0–10 on Grammar / Vocabulary / Structure / Coherence plus before-and-after corrections and native-style phrasings from Gemini (structured `responseSchema` output). Drafts auto-save locally. |
| **🆕 Spaced repetition** | Add any looked-up word to a review queue. SM-2 algorithm schedules cards with Again/Hard/Good/Easy buttons. Keyboard-driven, daily streak-aware, with a 7-day forecast on the progress page. |
| **🆕 Audio everywhere** | Tap-to-pronounce on every German word, example sentence, and review card via the Web Speech API (free, no setup, picks the best installed German voice). |
| **Progress dashboard** | Streak, XP, level (A1→C1), looked-up vocabulary, 30-day activity heatmap, daily-goal ring, SRS stats with retention rate. All in `localStorage` — no signup, no server. |

## Tech stack

- **Next.js 14.2.18** (App Router, RSC, edge-friendly API routes)
- **React 18.3.1** + **TypeScript 5.6.3**
- **Tailwind CSS 3.4.14** + **shadcn/ui** (New York, slate base)
- **Google Generative AI SDK 0.21.0** — Gemini 2.5 Flash for grading, word translation, and chat
- **Framer Motion 11**, **Lucide Icons**, **canvas-confetti**
- **next-themes** dark mode (default)
- Inter (body) + Space Grotesk (display) via `next/font/google`
- Hosting: **Vercel** (free tier). Persistence: `localStorage` (no database).

## Architecture in 60 seconds

```
app/
  api/grade/route.ts        → exact-match + Gemini semantic grading, 24h cache
  api/translate/route.ts    → on-demand word translation, in-memory cache
  api/chat/route.ts         → streaming response, last-10-messages window
  api/grade-essay/route.ts  → Gemini structured essay feedback (responseSchema)
  practice/translate        drills
  practice/read[/[id]]      reading library + reader with passage audio
  practice/chat             AI conversation
  practice/listen           dictation with audio + LCS-based diff
  practice/write            essay prompts + AI feedback
  practice/review           SRS daily review (SM-2)
  progress                  dashboard
lib/
  storage.ts                namespaced SSR-safe localStorage with pub/sub
  streaks.ts xp.ts          business logic
  vocabulary.ts             looked-up word store
  chatLimit.ts              50 messages/day per browser
  srs.ts                    SM-2 algorithm + due-card scheduling
  tts.ts                    Web Speech API wrapper (word + passage)
  writingPrompts.ts         A2/B1 prompt loader
  llm.ts                    lazy-init Gemini client, JSON extractor
content/
  translations/{a1,a2,b1}.json  drills with hints + grammar notes
  readings/{a1,a2,b1}.json      passages with vocab + comprehension Qs
  grammar/{a1,b1}-topics.json   grammar primers
  writing-prompts/{a2,b1}.json  essay prompts with hints + target length
```

## Quickstart

```bash
git clone https://github.com/JoelChandanshiv/deutsch-learning.git
cd deutsch-learning
npm install
cp .env.example .env.local   # paste your Gemini key (aistudio.google.com/app/apikey)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
| --- | :-: | --- |
| `GEMINI_API_KEY` | ✅ | Powers grading, word translation, and chat. Get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). |
| `GEMINI_MODEL_CONVERSATION` | ❌ | Override chat model (default `gemini-2.5-flash`) |
| `GEMINI_MODEL_GRADING` | ❌ | Override grader/translator model (default `gemini-2.5-flash`) |

Without an API key, the app still loads — exact-match drill grading works, and other AI features return graceful fallback messages.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Add `GEMINI_API_KEY` under Project Settings → Environment Variables.
4. Deploy.

That's it — there's no database to provision, no auth to configure, no background workers.

## Cost note

Designed to run on the Gemini API free tier for demo-level traffic. Both grader and translator cache aggressively (24h grade cache; per-word translation cache that makes repeat clicks free). Chat uses a 10-message context window and a 50-message-per-day-per-browser cap so a single user can't burn through quota.

## Roadmap

**Shipped in v2:**

- ✅ TTS audio on every word + sentence-level passage playback
- ✅ Spaced-repetition system (SM-2) over looked-up words
- ✅ B1 content (40 drills, 5 readings, 5 grammar primers)
- ✅ Listening (dictation) mode with audio + word-level diff
- ✅ Writing practice with structured AI feedback (Gemini `responseSchema`)

**v3 candidates:**

- More A1/A2/B1 drills + readings (current set covers ~1 week of daily practice)
- B2 and C1 content
- Optional accounts so progress syncs across devices
- Cloud TTS (Google / ElevenLabs) for higher-fidelity audio on devices without German voices
- Spaced-repetition for grammar concepts, not just words
- Stripe-backed Pro tier for unlimited chat messages

## License

MIT — see [LICENSE](LICENSE) if present, or treat the source as free to fork.

---

Built by [Joel Chandanshiv](https://github.com/JoelChandanshiv). Anti-Duolingo. No owl.
