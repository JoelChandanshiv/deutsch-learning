# DeutschPath

> Practice German from A1 to C1 — instant translation, AI conversation, and progress that sticks.

DeutschPath is a structured, recruiter-demoable German practice app with three modes (translation drills, click-to-translate readings, and AI conversation), CEFR-aligned content, and a local-only progress tracker.

**Live demo:** [deutsch-easy.vercel.app](https://deutsch-easy.vercel.app/)

---

## Features

| Mode | What it does |
| --- | --- |
| **Translation Drills** | Translate prompts both ways (en↔de). Instant grading by Claude Haiku with grammar notes and graceful exact-match short-circuit. |
| **Reading with Click-Translate** | Read real German passages — click *any* word for meaning, gender, and a generated example sentence. Aggressive in-memory caching means repeat clicks are instant. |
| **AI Conversation** | Stream a chat with Claude Sonnet in German at your CEFR level. Pick a scenario (restaurant, job interview, day, doctor, or free chat). Subtle `(Tipp: …)` corrections appear after grammar slips. |
| **Progress dashboard** | Streak, XP, level (A1→C1), looked-up vocabulary, 30-day activity heatmap, daily-goal ring. All in `localStorage` — no signup, no server. |

## Tech stack

- **Next.js 14.2.18** (App Router, RSC, edge-friendly API routes)
- **React 18.3.1** + **TypeScript 5.6.3**
- **Tailwind CSS 3.4.14** + **shadcn/ui** (New York, slate base)
- **Anthropic SDK 0.32.1** — Claude Sonnet for chat, Claude Haiku for grading + word translation
- **Framer Motion 11**, **Lucide Icons**, **canvas-confetti**
- **next-themes** dark mode (default)
- Inter (body) + Space Grotesk (display) via `next/font/google`
- Hosting: **Vercel** (free tier). Persistence: `localStorage` (no database).

## Architecture in 60 seconds

```
app/
  api/grade/route.ts      → exact-match + Claude Haiku semantic grading, 24h cache
  api/translate/route.ts  → on-demand word translation, in-memory word cache
  api/chat/route.ts       → streaming SSE-style response, last-10-messages window
  practice/translate     drills
  practice/read[/[id]]   reading library + reader
  practice/chat          AI conversation
  progress               dashboard
lib/
  storage.ts             namespaced + SSR-safe localStorage wrapper with pub/sub
  streaks.ts xp.ts       business logic
  vocabulary.ts          looked-up word store
  chatLimit.ts           50 messages/day per browser
  anthropic.ts           lazy-init SDK client, JSON extractor
content/
  translations/{a1,a2}.json  drills with hints + grammar notes
  readings/{a1,a2}.json      passages with vocab + comprehension Qs
  grammar/a1-topics.json     5 grammar primers
```

## Quickstart

```bash
git clone https://github.com/JoelChandanshiv/deutsch-learning.git
cd deutsch-learning
npm install
cp .env.example .env.local   # paste your Anthropic key
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
| --- | :-: | --- |
| `ANTHROPIC_API_KEY` | ✅ | Powers grading, word translation, and chat |
| `CLAUDE_MODEL_CONVERSATION` | ❌ | Override chat model (default `claude-sonnet-4-5-20250929`) |
| `CLAUDE_MODEL_GRADING` | ❌ | Override grader/translator model (default `claude-haiku-4-5-20251001`) |

Without an API key, the app still loads — exact-match drill grading works, and other AI features return graceful fallback messages.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Add `ANTHROPIC_API_KEY` under Project Settings → Environment Variables.
4. Deploy.

That's it — there's no database to provision, no auth to configure, no background workers.

## Cost note

Designed for ~₹500 / month at 100 active users. The grader and word-translator both use Claude Haiku (cheaper, high-volume) and cache aggressively. Chat uses Sonnet with a 10-message context window and a 50-message-per-day-per-browser cap so a single user can't burn the bill.

## Roadmap

This is an MVP. Slated for v2:

- B1, B2, C1 seeded content (current scaffold supports them already)
- Audio playback for readings (TTS for each sentence, not just per-word `speechSynthesis`)
- Optional accounts so progress syncs across devices
- Spaced-repetition scheduler over the looked-up-words list
- Stripe-backed Pro tier for unlimited chat messages

## License

MIT — see [LICENSE](LICENSE) if present, or treat the source as free to fork.

---

Built by [Joel Chandanshiv](https://github.com/JoelChandanshiv). Anti-Duolingo. No owl.
