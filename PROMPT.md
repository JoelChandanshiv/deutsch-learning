# 🚀 MASTER AI-AGENT PROMPT
## DeutschPath MVP — A1 to C1 German Practice Companion
### TIME-BOXED BUILD: Ship Live In 9-10 Hours

> **Instructions for Claude Code:**
> Read this ENTIRE specification carefully before writing any code. **You have a hard 9-10 hour budget.** Every phase has a strict time box. If a phase runs over by more than 30%, STOP, document the issue, and ask the user before continuing.
>
> **Build incrementally.** Complete and verify each phase before moving to the next. Commit to git after each phase.
>
> **Critical rules for this build:**
> - Pin every dependency version exactly
> - No auth, no database — use localStorage only
> - No paid services
> - Use shadcn/ui components — don't custom-build UI primitives
> - When in doubt, ship simpler. We can iterate later.
> - Do NOT add features beyond this spec. Scope creep kills the timeline.

---

## 🎯 PROJECT OBJECTIVE

Build **DeutschPath**, a structured German language practice web app:

- Supports CEFR levels **A1, A2, B1, B2, C1** (content seeded for A1+A2, scaffolded for higher levels)
- Three practice modes: **Translation Drills**, **Reading with click-translate**, **AI Conversation**
- Tracks **streaks, XP, level progress** in localStorage (no login required)
- Deploys live on **Vercel**
- Costs ~₹500/month at 100 users (just Claude API calls)
- Looks polished — recruiter-demoable in 30 seconds

**Brand:**
- Name: **DeutschPath**
- Tagline: *"Practice German from A1 to C1 — with instant translation, AI conversation, and progress that sticks."*
- Tone: Serious learners, not beginners. Anti-Duolingo (no cartoonish characters, no fake gamification).

---

## ⚙️ EXACT TECH STACK (Pin These Versions)

```
next: 14.2.18
react: 18.3.1
react-dom: 18.3.1
typescript: 5.6.3
tailwindcss: 3.4.14
@anthropic-ai/sdk: 0.32.1
framer-motion: 11.11.17
lucide-react: 0.460.0
clsx: 2.1.1
class-variance-authority: 0.7.1
tailwind-merge: 2.5.4
```

**shadcn/ui components** (install via `npx shadcn@latest add`):
- button, card, input, textarea, badge, dialog, popover, tabs, progress, separator, tooltip

**No backend server.** Use Next.js App Router API routes for the single Claude API call.

**Hosting:** Vercel (free tier).

**LLM:** Anthropic Claude API (`claude-sonnet-4-5-20250929` for conversation, `claude-haiku-4-5-20251001` for translation grading — cheaper for high-volume).

---

## 📁 PROJECT STRUCTURE

```
deutschpath/
├── app/
│   ├── layout.tsx                  # Root layout, dark mode, fonts
│   ├── page.tsx                    # Landing page
│   ├── practice/
│   │   ├── page.tsx                # Practice mode selector
│   │   ├── translate/page.tsx      # Translation drills
│   │   ├── read/page.tsx           # Reading practice
│   │   └── chat/page.tsx           # AI conversation
│   ├── progress/page.tsx           # Streak + XP dashboard
│   ├── api/
│   │   ├── translate/route.ts      # Word translation popover endpoint
│   │   ├── grade/route.ts          # Grade translation drill answers
│   │   └── chat/route.ts           # AI conversation (streaming)
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui primitives (auto-generated)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LevelBadge.tsx              # A1/A2/B1/B2/C1 badge
│   ├── WordPopover.tsx             # Click-any-word translation popover
│   ├── TranslationDrill.tsx        # Single drill card
│   ├── ReadingPassage.tsx          # Renders article with clickable words
│   ├── ChatInterface.tsx           # AI conversation UI
│   ├── StreakDisplay.tsx           # Fire icon + day count
│   ├── XPBar.tsx                   # Progress bar with level
│   └── LevelSelector.tsx           # Choose your CEFR level
├── lib/
│   ├── storage.ts                  # localStorage wrappers (typed)
│   ├── streaks.ts                  # Streak logic (last_active, current_streak)
│   ├── xp.ts                       # XP calculation + level progression
│   ├── anthropic.ts                # Anthropic client + helpers
│   └── utils.ts                    # cn() and misc helpers
├── content/
│   ├── translations/
│   │   ├── a1.json                 # 30 A1 translation drills
│   │   └── a2.json                 # 20 A2 translation drills
│   ├── readings/
│   │   ├── a1.json                 # 5 A1 reading passages
│   │   └── a2.json                 # 5 A2 reading passages
│   └── grammar/
│       └── a1-topics.json          # 5 A1 grammar topic summaries
├── public/
│   └── og-image.png
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## ⏱️ PHASE-BY-PHASE BUILD (STRICT TIME BUDGET)

### **PHASE 1: Scaffold + Design System** (60-90 minutes)

**Goal:** Working Next.js app with shadcn/ui, dark mode, branded landing page.

**Tasks:**
1. `npx create-next-app@14.2.18 deutschpath --typescript --tailwind --app --no-src-dir --turbo`
2. `cd deutschpath && git init`
3. Install dependencies (exact pinned versions)
4. Install shadcn/ui: `npx shadcn@latest init` (choose: New York style, Slate base, CSS variables yes)
5. Install components: `npx shadcn@latest add button card input textarea badge dialog popover tabs progress separator tooltip`
6. Set up design system in `globals.css`:
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 240 10% 3.9%;
     --primary: 38 92% 50%;        /* warm gold — German flag accent */
     --accent: 0 73% 51%;           /* German red */
     --muted: 240 4.8% 95.9%;
     --border: 240 5.9% 90%;
     --radius: 0.75rem;
   }
   .dark {
     --background: 240 10% 3.9%;
     --foreground: 0 0% 98%;
     --primary: 38 92% 60%;
     --accent: 0 73% 60%;
     --muted: 240 3.7% 15.9%;
     --border: 240 3.7% 15.9%;
   }
   ```
7. Use **Inter** for body, **Space Grotesk** for headings via `next/font/google`
8. Build `Navbar.tsx` (sticky, logo "DeutschPath" + nav: Practice / Progress)
9. Build `Footer.tsx` (minimal: "Built by Joel Chandanshiv" + GitHub link)
10. Build landing page `app/page.tsx`:
    - Hero: Big headline, tagline, "Start Practicing" CTA → `/practice`
    - 3 feature cards: Translation Drills / Reading / AI Conversation
    - "Why DeutschPath" section (anti-Duolingo positioning, 3 points)
    - No auth wall, no signup. Just a "Start" button.
11. Dark mode by default. Add a subtle light/dark toggle (use next-themes if quick, else skip).
12. Commit: `git commit -m "phase 1: scaffold + landing"`

**Verification:**
- [ ] `npm run dev` works, no errors
- [ ] Landing page looks polished (not generic)
- [ ] Dark mode looks great
- [ ] Mobile responsive (test at 375px)
- [ ] CTA button works (routes to `/practice`)

---

### **PHASE 2: Storage Layer + XP/Streak Logic** (45-60 minutes)

**Goal:** TypeScript-typed localStorage wrappers + streak/XP business logic.

**Tasks:**
1. Build `lib/storage.ts`:
   ```ts
   // Typed localStorage wrapper. Handles JSON parse/stringify, SSR safety.
   // Provides: getItem<T>(key: string, fallback: T): T
   //           setItem<T>(key: string, value: T): void
   // Uses a versioned namespace: "deutschpath:v1:<key>"
   ```
2. Build `lib/streaks.ts`:
   - `getStreak()` returns `{ current: number, longest: number, lastActiveDate: string }`
   - `recordActivity()` updates streak (handles same-day, next-day, broken-streak logic)
   - Uses ISO date string `YYYY-MM-DD` for comparison
3. Build `lib/xp.ts`:
   - `getXP()` returns `{ total: number, level: string, progress: number }` where level is current CEFR level
   - `addXP(amount: number)` adds XP and recalculates level
   - Level thresholds: A1: 0 XP, A2: 500 XP, B1: 2000 XP, B2: 5000 XP, C1: 12000 XP
   - XP rewards: correct translation = 10 XP, full reading = 30 XP, chat message in German = 5 XP
4. Build `LevelSelector.tsx` — user can manually override their level (saved to localStorage)
5. Build `StreakDisplay.tsx` — fire icon + "{N} day streak" badge in top-right of navbar
6. Build `XPBar.tsx` — horizontal progress bar showing current level + XP to next

**Verification:**
- [ ] localStorage persists across page refreshes
- [ ] Streak increments correctly when activity recorded on a new day
- [ ] Streak breaks when a day is skipped
- [ ] XP added shows up immediately in navbar
- [ ] No errors on first visit (no localStorage data yet)

**CRITICAL: Use `useEffect` for localStorage reads to avoid SSR hydration errors.**

---

### **PHASE 3: Seed Content + Content Loaders** (45-60 minutes)

**Goal:** Quality A1 + A2 content loaded as JSON, ready to be consumed by practice modes.

**Tasks:**
1. Create `content/translations/a1.json` with **30 translation drills** in this format:
   ```json
   [
     {
       "id": "a1-001",
       "level": "A1",
       "topic": "greetings",
       "direction": "en-to-de",
       "prompt": "Hello, my name is Anna.",
       "answer": "Hallo, ich heiße Anna.",
       "alternatives": ["Hallo, mein Name ist Anna."],
       "hint": "Use 'ich heiße' for 'my name is'",
       "grammarNote": "In German, you can say 'ich heiße X' (I am called X) or 'mein Name ist X'."
     }
   ]
   ```
   **Topics to cover in A1:** greetings (5), introducing yourself (5), numbers/time (5), family (5), food/drinks (5), daily routines (5).

2. Create `content/translations/a2.json` with **20 A2 drills** covering:
   - Past tense (Perfekt)
   - Modal verbs
   - Conjunctions (weil, dass, wenn)
   - Comparatives
   - Common adjectives

3. Create `content/readings/a1.json` with **5 short A1 passages** (each 50-100 words):
   ```json
   [
     {
       "id": "a1-read-001",
       "level": "A1",
       "title": "Mein Wochenende",
       "passage": "Am Samstag stehe ich um neun Uhr auf...",
       "translation": "On Saturday I get up at nine o'clock...",
       "vocabulary": [
         { "word": "Wochenende", "meaning": "weekend", "type": "noun-neuter" },
         { "word": "aufstehen", "meaning": "to get up", "type": "verb-separable" }
       ],
       "comprehensionQuestions": [
         { "q": "Wann steht der Autor am Samstag auf?", "a": "Um neun Uhr." }
       ]
     }
   ]
   ```

4. Create `content/readings/a2.json` with **5 A2 passages** (100-200 words each).

5. Create `content/grammar/a1-topics.json` with 5 grammar summaries (articles, present tense, sein/haben, pronouns, basic word order).

**IMPORTANT CONTENT RULES:**
- Use **correct, idiomatic German** — verify grammar
- Translations should be natural English, not literal
- Topics should be **practical and useful**, not "the cat sits on the mat" nonsense
- For nouns in vocabulary, ALWAYS include gender (`noun-masculine`, `noun-feminine`, `noun-neuter`)

**You may generate this content using Claude during the build — but verify each entry.**

**Verification:**
- [ ] All JSON files validate
- [ ] German is grammatically correct
- [ ] Vocabulary includes gender for all nouns
- [ ] Loading these files in a Next.js component works without errors

---

### **PHASE 4: Translation Drill Mode** (90-120 minutes)

**Goal:** Working translation practice with instant grading.

**Tasks:**
1. Build `app/practice/translate/page.tsx`:
   - Reads user's level from localStorage
   - Loads drills for that level from JSON content
   - Shows ONE drill at a time
   - User types answer in textarea
   - "Check" button → calls `/api/grade` to grade the answer
   - Shows result: ✅ correct / ⚠️ close / ❌ incorrect
   - For wrong answers, shows the correct answer + grammar note + explanation
   - "Next" button → loads next drill
   - Tracks session stats (correct/total) in top of page
   - Each correct answer awards 10 XP

2. Build `app/api/grade/route.ts`:
   - POST endpoint accepting `{ prompt, userAnswer, correctAnswer, alternatives, level }`
   - **Smart grading logic:**
     - If exact match (case-insensitive, ignore punctuation) → return `{ status: "correct" }`
     - If match against alternatives → return `{ status: "correct" }`
     - Else, call Claude Haiku to check semantic equivalence
   - Claude Haiku prompt template:
     ```
     You are a German language teacher grading a student's translation.
     English prompt: "{prompt}"
     Expected German: "{correctAnswer}"
     Student wrote: "{userAnswer}"
     Level: {level}

     Reply in JSON only:
     {
       "status": "correct" | "close" | "incorrect",
       "feedback": "1-2 sentences explaining what's right/wrong",
       "correctedAnswer": "the corrected version if needed",
       "encouragement": "brief encouragement"
     }
     ```
   - Cache identical requests for 24 hours (use a simple in-memory Map; this is server-side, ephemeral, fine for v1)

3. Build `TranslationDrill.tsx` — the card component:
   - Shows prompt at top
   - Textarea (focuses on mount, Enter key submits)
   - "Check" button
   - Result panel slides in below with Framer Motion
   - Color-coded border: green/yellow/red based on result
   - "Show hint" button (subtle, reveals the hint from JSON)

4. After 10 correct in a row → confetti animation (use `canvas-confetti`)

5. Award XP via `lib/xp.ts` on correct answers. Update streak via `lib/streaks.ts`.

**Verification:**
- [ ] Can complete a drill end-to-end
- [ ] Wrong answer gets useful feedback from Claude
- [ ] XP increments visibly
- [ ] Mobile-friendly (textarea doesn't break on phone keyboard)
- [ ] Average grading latency < 2 seconds

---

### **PHASE 5: Reading Mode + Word Translation Popover (THE KILLER FEATURE)** (90-120 minutes)

**Goal:** Read a German passage, click any word → instant translation in a popover.

**Tasks:**
1. Build `ReadingPassage.tsx`:
   - Receives a passage text
   - Splits text into clickable word spans (preserve punctuation, spaces)
   - Each word span has `onClick` handler → opens `WordPopover`
   - Hover state: subtle underline on words to signal interactivity

2. Build `WordPopover.tsx`:
   - Uses shadcn/ui `Popover`
   - Shows loading spinner while fetching translation
   - Displays: word, meaning, gender (if noun), example sentence
   - For known vocabulary (in `passage.vocabulary` JSON), use that data directly — no API call needed
   - For unknown words, calls `/api/translate`

3. Build `app/api/translate/route.ts`:
   - POST endpoint accepting `{ word: string, context?: string }`
   - Calls Claude Haiku with prompt:
     ```
     Translate this German word: "{word}"
     Context (sentence it appears in): "{context}"

     Reply in JSON only:
     {
       "word": "{word}",
       "meaning": "primary English meaning(s)",
       "partOfSpeech": "noun|verb|adjective|...",
       "gender": "der|die|das" (only if noun, else null),
       "example": "a simple German example sentence",
       "exampleTranslation": "English translation of example"
     }
     ```
   - Cache aggressively (same word → same response). In-memory Map keyed by lowercased word is fine.

4. Build `app/practice/read/page.tsx`:
   - Lists available readings for user's level
   - Click a reading → opens reading view with passage rendered via `ReadingPassage`
   - Side panel shows: comprehension questions, full translation (toggle to reveal)
   - "Complete Reading" button awards 30 XP

5. **Bonus:** Track which words the user has looked up. Show them at the end as a "Words you looked up" list with option to add to vocabulary (saved in localStorage).

**Verification:**
- [ ] Clicking a word opens popover within 1.5 seconds
- [ ] Popover shows correct grammatical info
- [ ] Multiple clicks on same word are instant (cache hit)
- [ ] Long passages don't lag the UI
- [ ] Works on mobile (tap a word, popover appears)

---

### **PHASE 6: AI Conversation Mode** (75-90 minutes)

**Goal:** Chat with Claude in German at your level, get gentle corrections.

**Tasks:**
1. Build `app/practice/chat/page.tsx`:
   - Topic selector at top: "Free Chat", "Order at a Restaurant", "Job Interview", "Tell about your day", "Visit a Doctor"
   - Below: chat interface (like ChatGPT)
   - User types in German → AI responds in German at appropriate level
   - AI subtly corrects user's German with `[correction]` annotations
   - Each user message in German = 5 XP

2. Build `ChatInterface.tsx`:
   - Message list (user right, AI left)
   - Input box at bottom, submit on Enter
   - Streams AI response (use Anthropic SDK streaming)
   - Renders message bubbles with framer-motion fade-in

3. Build `app/api/chat/route.ts`:
   - Streaming endpoint (use Anthropic SDK's `messages.stream`)
   - System prompt template:
     ```
     You are a friendly German language tutor. The student is at CEFR level {level}.

     Rules:
     - Respond entirely in German appropriate for {level} level
     - Keep sentences short and clear at A1/A2; longer and more nuanced at B1+
     - If the student made grammar errors, gently correct them: include
       a brief "(Tipp: ...)" note at the end of your message in English
     - Stay on the chosen topic: {topic}
     - Be encouraging and patient
     - Use simple vocabulary at A1/A2

     Begin the conversation.
     ```
   - Returns SSE stream

4. **Token-saving trick:** Limit conversation history sent to API to last 10 messages. Older messages are summarized once and stored.

5. **Daily limit:** Cap at 50 messages/day per browser session (tracked in localStorage). After 50, show: "You've done great today! Come back tomorrow." This protects the API key from runaway usage.

**Verification:**
- [ ] AI responds in German at appropriate level
- [ ] Streaming works (text appears progressively, not all at once)
- [ ] Grammar corrections appear after user mistakes
- [ ] Daily limit kicks in correctly
- [ ] Topic selection changes the conversation context

---

### **PHASE 7: Progress Dashboard + Polish** (45-60 minutes)

**Goal:** A nice "Progress" page showing user stats, plus final polish.

**Tasks:**
1. Build `app/progress/page.tsx`:
   - **Big number:** Current streak with fire icon
   - **XP card:** Total XP + level + progress bar to next level
   - **Stats:** Total drills completed, words looked up, chat messages sent
   - **Heatmap:** Last 30 days of activity (like GitHub contribution graph) — use a simple grid
   - **Vocabulary list:** Words the user has looked up (collapsible)
   - **CTA:** "Keep your streak alive! Practice now →"

2. Add a "Daily Goal" tracker: 50 XP/day. Show progress on every page.

3. **Final polish:**
   - Loading skeletons everywhere there's async data
   - Empty states ("No words looked up yet — try a reading!")
   - Error boundaries on all routes
   - 404 page with personality
   - Open Graph image (1200x630, "DeutschPath — Practice German A1 to C1")
   - SEO meta tags (`<title>`, `<meta description>`)
   - Favicon (simple "D" on dark background)

**Verification:**
- [ ] Progress page renders correctly with mock data and empty state
- [ ] Heatmap looks good with sparse data
- [ ] All pages have proper meta tags
- [ ] Loading states feel snappy

---

### **PHASE 8: Deploy + README** (30-45 minutes)

**Goal:** Live on Vercel with a README that recruiters can read.

**Tasks:**
1. Create `.env.example`:
   ```
   ANTHROPIC_API_KEY=
   ```

2. Create `README.md`:
   - Hero with screenshot placeholder
   - Live demo URL
   - Features list
   - Tech stack badges
   - Quickstart: clone, set env, run dev
   - Roadmap section: "Coming soon: audio, accounts, B1-C1 content, payments"
   - License: MIT

3. Create `.gitignore` with `node_modules`, `.next`, `.env*.local`, etc.

4. `git add . && git commit -m "deutschpath mvp v1"`

5. Push to GitHub: create new repo `deutschpath`, push to `main`

6. Deploy to Vercel:
   - Import repo
   - Add env var: `ANTHROPIC_API_KEY`
   - Deploy
   - Set custom subdomain: `deutschpath.vercel.app`

7. Test live URL end-to-end

**Verification:**
- [ ] Live URL works
- [ ] Anthropic API calls succeed in production
- [ ] All three practice modes work live
- [ ] No console errors in production
- [ ] Mobile works
- [ ] Shareable OG image displays correctly when URL is pasted into Twitter/WhatsApp

---

## 🚨 STRICT TIME-MANAGEMENT RULES

**This is non-negotiable for the 9-10 hour budget:**

1. **Hard checkpoint at 5 hours:** If Phases 1-4 aren't done, STOP and ask the user. Don't try to push through.

2. **No feature creep.** If the user (Joel) suggests adding audio, login, payments, or more content during the build → respond: *"Noted as v2 feature. Continuing with current phase."*

3. **Use shadcn/ui as-is.** No custom UI primitives. No "I'll just tweak this Tailwind real quick" — that's how 30 minutes becomes 3 hours.

4. **Defer perfection.** If a button doesn't look pixel-perfect, ship it. Polish in v2.

5. **Test on each phase, not at the end.** A broken Phase 3 found at Phase 7 means rebuilding 4 phases.

6. **Commit after each phase.** This lets us `git reset --hard` if a phase breaks something.

7. **No new dependencies past Phase 1.** Every `npm install` mid-build wastes 5+ minutes and adds bug surface.

---

## 🛑 BLOCKER PROTOCOL

If you hit a blocker:

1. **Spend max 10 minutes debugging.**
2. **If still stuck:** Document the error clearly. Ask the user. Don't silently work around with worse architecture.
3. **Common blockers and quick fixes:**
   - **localStorage SSR error:** Wrap reads in `useEffect`, not at component top level
   - **Anthropic API 401:** User needs to add `ANTHROPIC_API_KEY` to `.env.local`
   - **Hydration mismatch:** Don't render time-dependent or random content during SSR
   - **Streaming response not appearing:** Check that response uses `transfer-encoding: chunked` and React state updates on each chunk

---

## ✅ FINAL VERIFICATION CHECKLIST

Before declaring done:

- [ ] Live URL is functional
- [ ] User can complete 5 translation drills end-to-end
- [ ] User can read a passage and click words for translations
- [ ] User can have a German conversation with AI
- [ ] Streak increments when user practices today
- [ ] XP shows on every page
- [ ] Progress dashboard renders
- [ ] All pages mobile-responsive (test at 375px)
- [ ] No console errors in production
- [ ] README is recruiter-ready
- [ ] All env vars documented in `.env.example`
- [ ] Anthropic API daily cost is < ₹50 at expected demo usage

---

## 🎯 DESIGN NOTES (Brief — Don't Overthink)

- **Typography:** Inter for body, Space Grotesk for headings. Generous line-height. Don't go below 16px body text.
- **Colors:** Black/charcoal dark mode. German flag accents (gold + red) used sparingly. No purple — too "AI startup."
- **Spacing:** Tailwind default scale. Lots of whitespace. Don't crowd elements.
- **Animations:** Subtle. Use Framer Motion `motion.div` with `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}` for entry. That's enough.
- **Microcopy:** Friendly, smart. *"Nice — that's the dative!"* not *"Correct."* But don't be cringe.
- **Hero copy on landing:**
  - Headline: *"German practice that respects your intelligence."*
  - Subhead: *"Structured drills, real readings, and AI conversation for serious learners from A1 to C1. Free. No ads. No owl."*

---

## 📦 ENVIRONMENT VARIABLES

`.env.example`:
```
# Anthropic API key for grading + word translation + AI conversation
ANTHROPIC_API_KEY=

# Optional: override default models
CLAUDE_MODEL_CONVERSATION=claude-sonnet-4-5-20250929
CLAUDE_MODEL_GRADING=claude-haiku-4-5-20251001
```

---

## 🚀 BUILD ORDER (FINAL)

Execute in this exact sequence with strict time-boxing:

1. **Phase 1 (60-90 min):** Scaffold + landing page
2. **Phase 2 (45-60 min):** localStorage + streak + XP logic
3. **Phase 3 (45-60 min):** Seed content (A1 + A2 JSON)
4. **Phase 4 (90-120 min):** Translation drills + grading API
5. **Phase 5 (90-120 min):** Reading mode + word popover (THE KILLER FEATURE)
6. **Phase 6 (75-90 min):** AI conversation streaming
7. **Phase 7 (45-60 min):** Progress dashboard + polish
8. **Phase 8 (30-45 min):** Deploy + README

**Total estimated:** 8 hours 20 min – 11 hours

**Buffer built in:** ~30 min for unexpected debugging

After each phase, run `git commit -m "phase N: <description>"`.

If at any point the total elapsed time exceeds 7 hours and you're not yet on Phase 6, ask the user whether to skip the chat feature and go straight to Phase 7-8.

---

**Begin now with Phase 1. Build, verify, commit, then move on.**
