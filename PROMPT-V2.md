# 🚀 MASTER AI-AGENT PROMPT
## DeutschPath v2 — Audio + Spaced Repetition + B1 + Writing Practice
### TIME-BOXED BUILD: 10-15 Hours

> **Instructions for Claude Code:**
> Read this ENTIRE specification carefully. This is **v2** of an existing live project at https://deutsch-easy.vercel.app. The v1 codebase is already in this repo on `main` branch.
>
> **CRITICAL: Do not rewrite v1. Extend it.** Add to existing files. Add new files. Do not regenerate anything that already works.
>
> **Strict time budget: 10-15 hours.** If you run over budget on any phase by >30%, stop and ask the user before continuing.
>
> Phases are ordered by **impact-per-hour**. If time runs out, the last phase (Writing Practice) can be deferred to v3 — that is acceptable.
>
> Build incrementally. Commit after each phase. Test on production after Phase 4.

---

## 🎯 PROJECT CONTEXT

**Existing v1 (already shipped):**
- Live: https://deutsch-easy.vercel.app
- Source: https://github.com/JoelChandanshiv/deutsch-learning
- Stack: Next.js 14.2.18, TypeScript, Tailwind, shadcn/ui, Google Gemini API, Groq API
- Features: A1/A2 translation drills, click-to-translate readings, AI German chat, streaks, XP, vocabulary tracking
- Storage: localStorage only (no auth, no DB)

**v2 adds (in priority order):**
1. ✅ **TTS audio pronunciation** (every German word + reading passages)
2. ✅ **Vocabulary spaced repetition** (Anki-style SM-2 daily review)
3. ✅ **B1 level unlock** with structured content
4. ✅ **100 new drills + 15 new readings** across A1/A2/B1
5. ✅ **Writing practice** (essay → AI feedback) — DEFER if time runs out
6. ✅ **Listening practice mode** (audio passages with transcripts) — included automatically once Phase 1 audio is built

**v2 does NOT add:**
- ❌ User accounts (stays localStorage)
- ❌ Database / Supabase
- ❌ Email notifications
- ❌ B2/C1 content (defer until users reach B1 in numbers)
- ❌ Payments / pro tier

---

## ⚙️ NEW DEPENDENCIES (Add to existing package.json)

Add these exact versions to the existing `package.json`:

```json
{
  "@google-cloud/text-to-speech": "5.5.0",
  "@types/node-cache": "4.2.5",
  "node-cache": "5.1.2"
}
```

Use `npm install` after editing — verify no peer-dependency warnings.

**Do NOT change existing dependency versions.** They work; leave them.

---

## 🔑 NEW ENVIRONMENT VARIABLES

Add to `.env.example` AND `.env.local`:

```
# Google Cloud TTS (free tier: 4M chars/month for standard voices)
# Get from: https://console.cloud.google.com → Create project → Enable TTS API → Create service account → download JSON key
# Paste the FULL JSON content as a single line (escaped) into this variable
GOOGLE_TTS_CREDENTIALS=

# Alternative: if user already has GEMINI_API_KEY (Google AI Studio key), it may also work for TTS — check this first to avoid setting up Google Cloud separately
```

**IMPORTANT:** Before forcing the user to set up Google Cloud TTS (which is a 30-min process), try this simpler alternative first:

**Alternative TTS provider — use this if Google Cloud setup is painful:**

```
# Free, no signup needed, browser-based fallback
# OR use ElevenLabs free tier (10K chars/month)
ELEVENLABS_API_KEY=
```

**Tertiary fallback:** Use the **Web Speech API** on the client side. This is browser-built-in, free forever, no API key needed, but quality varies by browser. Use this as the default; offer cloud TTS as an upgrade.

**My recommendation to Claude Code:** Default to Web Speech API. Add Google Cloud TTS as an optional upgrade with a toggle. This saves the user from setup hell AND keeps audio truly free forever.

---

## 📁 NEW FILES TO ADD

```
app/
  api/
    tts/route.ts                  # NEW: TTS endpoint (if using cloud TTS)
    grade-essay/route.ts          # NEW: Writing practice grading
  practice/
    review/page.tsx               # NEW: SRS daily review screen
    write/page.tsx                # NEW: Writing practice
    listen/page.tsx               # NEW: Listening practice (bonus from audio)
components/
  AudioButton.tsx                 # NEW: Click-to-pronounce button
  ReviewSession.tsx               # NEW: SRS review card flow
  ReviewQueueIndicator.tsx        # NEW: Shows "X words due today" in navbar
  WritingPad.tsx                  # NEW: Essay writing UI
  EssayFeedback.tsx               # NEW: AI feedback display
  ListenAndType.tsx               # NEW: Dictation exercise (uses audio)
lib/
  srs.ts                          # NEW: SM-2 algorithm + scheduling
  tts.ts                          # NEW: TTS client (web speech + cloud fallback)
content/
  translations/
    b1.json                       # NEW: B1 translation drills (40-60)
  readings/
    b1.json                       # NEW: B1 reading passages (5-10)
  grammar/
    b1-topics.json                # NEW: B1 grammar summaries
  writing-prompts/
    a2.json                       # NEW: A2 writing prompts
    b1.json                       # NEW: B1 writing prompts
```

**Files to MODIFY (extend, don't rewrite):**
- `lib/storage.ts` — Add new storage keys for SRS queue and writing history
- `components/WordPopover.tsx` — Add audio button next to the word
- `components/Navbar.tsx` — Add "Review (X due)" link, link to writing
- `app/practice/page.tsx` — Add cards for new modes (Review, Listen, Write)
- `app/practice/read/page.tsx` — Add "Play passage audio" button
- `app/progress/page.tsx` — Add SRS stats card (cards reviewed, retention rate)
- `content/translations/a1.json` — Add 30 more drills
- `content/translations/a2.json` — Add 30 more drills
- `content/readings/a1.json` — Add 5 more passages
- `content/readings/a2.json` — Add 5 more passages

---

## ⏱️ PHASE-BY-PHASE BUILD

### **PHASE 1: TTS Audio System** (2-3 hours)

**Goal:** Every German word and passage can be pronounced. Use Web Speech API as default, cloud TTS as optional upgrade.

**Tasks:**

1. **Build `lib/tts.ts`:**
   ```typescript
   // Strategy:
   // 1. Default: use browser's built-in SpeechSynthesisUtterance with German voice
   // 2. If GOOGLE_TTS_CREDENTIALS is set, offer cloud TTS as "premium audio"
   // 3. Cache cloud audio blobs in IndexedDB by text hash

   export async function speak(text: string, opts?: { rate?: number; pitch?: number }): Promise<void>;
   export async function preloadAudio(text: string): Promise<void>;
   export function isCloudTTSAvailable(): boolean;
   ```

   **Critical implementation details:**
   - Web Speech API needs `voices` to be loaded — handle the `voiceschanged` event
   - Filter voices to find German (`lang.startsWith('de')`)
   - Prefer `de-DE` voice over `de-AT` or `de-CH`
   - Default rate: 0.9 (slightly slow for learners)
   - Default pitch: 1.0

2. **Build `components/AudioButton.tsx`:**
   - Small speaker icon button (lucide `Volume2`)
   - On click: plays the word/text
   - During playback: shows `Volume2` with subtle pulse animation
   - On error: silently fail (don't show error toast for audio)
   - Accept `text` prop and optional `size` prop

3. **Integrate into `WordPopover.tsx`:**
   - Add `AudioButton` next to the word at the top of the popover
   - Also add small audio button next to the example sentence

4. **Add "Play Passage" button to `app/practice/read/page.tsx`:**
   - At the top of each reading passage
   - When clicked, reads the full passage with slight pauses between sentences
   - Show progress (highlight current sentence) — optional polish

5. **Build `app/api/tts/route.ts` (only if implementing cloud TTS):**
   - POST endpoint: `{ text: string }` → audio bytes
   - Uses Google Cloud TTS SDK
   - Returns audio/mpeg with 1-day cache-control
   - In-memory cache: `node-cache` with 24h TTL keyed by text hash

**Verification:**
- [ ] Click audio button → German pronunciation plays
- [ ] Works in Chrome, Firefox, Safari (test all three)
- [ ] Passage audio plays full passage at a learnable pace
- [ ] No console errors
- [ ] If user has no German voice installed, gracefully fallback (warn once)

**Commit:** `git commit -m "phase 1 v2: tts audio with web speech api"`

---

### **PHASE 2: Vocabulary Spaced Repetition System** (3-4 hours)

**Goal:** Words the user has looked up via popover automatically enter a daily review queue. Anki-style SM-2 algorithm.

**Tasks:**

1. **Design the SRS data model in `lib/storage.ts`:**
   ```typescript
   type ReviewCard = {
     id: string;              // word itself, lowercased
     word: string;
     meaning: string;
     gender?: 'der' | 'die' | 'das';
     example?: string;
     exampleTranslation?: string;
     // SM-2 state:
     ease: number;            // ease factor, default 2.5
     interval: number;        // days until next review
     repetitions: number;     // consecutive successful reviews
     nextReview: string;      // ISO date YYYY-MM-DD
     lastReviewed: string;
     createdAt: string;
   };
   ```

2. **Build `lib/srs.ts` — SM-2 algorithm:**
   ```typescript
   // Quality: 0 = "Again" (forgot), 3 = "Hard", 4 = "Good", 5 = "Easy"
   export function scheduleNextReview(card: ReviewCard, quality: 0 | 3 | 4 | 5): ReviewCard;
   export function getDueCards(): ReviewCard[];
   export function getDueCount(): number;
   export function addWordToReview(word: WordData): void;
   export function recordReview(cardId: string, quality: 0 | 3 | 4 | 5): void;
   ```

   **SM-2 implementation (use this exact pattern, do not improvise):**
   ```typescript
   function scheduleNextReview(card: ReviewCard, quality: 0 | 3 | 4 | 5): ReviewCard {
     let { ease, interval, repetitions } = card;

     if (quality < 3) {
       // Failed — reset
       repetitions = 0;
       interval = 1;
     } else {
       repetitions += 1;
       if (repetitions === 1) interval = 1;
       else if (repetitions === 2) interval = 6;
       else interval = Math.round(interval * ease);

       ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
       ease = Math.max(1.3, ease);
     }

     const nextReview = addDays(new Date(), interval);
     return { ...card, ease, interval, repetitions, nextReview, lastReviewed: today() };
   }
   ```

3. **Auto-add words to review queue:**
   - In `WordPopover.tsx`, when the popover opens, check if the word is already in the SRS queue
   - If not: show "Add to review" button (one click adds it)
   - Optional: auto-add on the 2nd lookup of the same word (signals interest)

4. **Build `app/practice/review/page.tsx`:**
   - Shows due cards one at a time
   - Front: German word (with audio button)
   - User clicks "Show meaning"
   - Back: meaning + example + grammar
   - 4 buttons at bottom: "Again" (0) | "Hard" (3) | "Good" (4) | "Easy" (5)
   - On click: schedule next review, move to next card
   - End screen: "X cards reviewed. Y due tomorrow. Z due in 3 days. Best streak: N"
   - Award XP: 5 per "Good"/"Easy" review

5. **Build `components/ReviewQueueIndicator.tsx`:**
   - In navbar: red badge if cards are due today
   - Click → `/practice/review`

6. **Add Review card to `app/practice/page.tsx`:**
   - "Daily Review" card at the top of practice modes
   - Subtitle: "X words due today"
   - If 0 due: "All caught up! Look up new words to add to review."

7. **Add SRS stats to `app/progress/page.tsx`:**
   - Total cards in review system
   - Cards reviewed today / this week
   - Retention rate (cards rated "Good"/"Easy" / total reviews) — last 7 days
   - Average interval

**Verification:**
- [ ] Look up a word in a reading → see "Add to review" button
- [ ] Click → word is added
- [ ] Visit `/practice/review` → see the card due today
- [ ] Rate as "Good" → card moves out of today's queue
- [ ] Visit again next day → due cards reappear
- [ ] SRS stats show on progress page
- [ ] No words in queue → review page shows friendly empty state

**Commit:** `git commit -m "phase 2 v2: spaced repetition vocabulary system"`

---

### **PHASE 3: B1 Level Content Unlock** (1-2 hours)

**Goal:** B1 level becomes a real, usable level with structured content.

**Tasks:**

1. **Create `content/translations/b1.json` with 40 B1 drills:**
   - Use Claude (via this chat) to generate in batches of 20
   - Topics: Konjunktiv II (10), Passiv (10), relative clauses (10), Konnektoren (10)
   - All grammatically verified
   - Same JSON schema as a1.json / a2.json
   - Genuinely B1-level complexity (NOT just slightly harder A2)

2. **Create `content/readings/b1.json` with 5 B1 passages (200-400 words each):**
   - Source ideas: news articles (rewritten), short essays, opinion pieces
   - Topics: technology, environment, German culture, work life
   - More abstract vocabulary
   - Include 8-15 vocabulary entries per reading
   - 3-4 comprehension questions each (open-ended OK)

3. **Create `content/grammar/b1-topics.json`:**
   - 5 grammar topic summaries: Konjunktiv II, Passiv, Relativsätze, Nominalisierung, Modalverben in der Vergangenheit
   - Each has: title, summary (3-5 paragraphs), key examples, common mistakes

4. **Update `LevelSelector.tsx`:**
   - Make B1 fully selectable (was scaffolded in v1)
   - Add "NEW" badge briefly (first 30 days?)
   - Tooltip: "B1: Independent user. Can handle most situations while traveling."

5. **Add B1 to CEFR badges everywhere:**
   - Hero "A1 · A2 · B1 · B2 · C1" — emphasize B1 visually now
   - Progress page level chip

6. **(Optional, if time permits)** Add a "Level Test" — 10-question quiz that recommends your level. Skip if time is tight.

**Content rules (REPEAT from v1, do not violate):**
- Every noun must have gender (`der`/`die`/`das` or `noun-masculine`/`noun-feminine`/`noun-neuter`)
- Translations should be natural English, not literal
- German must be grammatically perfect — when in doubt, ask user to verify

**Verification:**
- [ ] B1 selectable in level selector
- [ ] B1 drills load and work in translation drill mode
- [ ] B1 readings render with click-to-translate
- [ ] All German grammar is correct

**Commit:** `git commit -m "phase 3 v2: b1 level unlocked with 40 drills + 5 readings"`

---

### **PHASE 4: Expand A1 + A2 Content** (1-2 hours)

**Goal:** Bulk up existing levels so users don't run out of practice on day 1.

**Tasks:**

1. **Add 30 more A1 drills** to `content/translations/a1.json`:
   - Topics: shopping (5), directions (5), weather (5), hobbies (5), simple opinions (5), days/months (5)
   - All Präsens tense only at A1

2. **Add 30 more A2 drills** to `content/translations/a2.json`:
   - Topics: Präteritum vs Perfekt comparison (10), reflexive verbs (5), separable verbs (5), comparatives + superlatives (5), wenn/wann/als (5)

3. **Add 5 more A1 readings** (50-100 words each):
   - Topics: introducing yourself in detail, describing your hometown, daily routine variations, food preferences, weekend plans

4. **Add 5 more A2 readings** (100-200 words each):
   - Topics: travel experiences, comparing cities, work life, hobbies and interests, family stories

5. **Spot-check existing content for errors** — fix any grammar issues you spot in v1 content

**This phase is content-heavy, code-light.** Use Claude (via the user's chat) to generate, but have user paste-verify each batch.

**Verification:**
- [ ] A1 has 60+ drills total
- [ ] A2 has 50+ drills total
- [ ] All new content has correct German
- [ ] User can practice for a week+ without seeing repeat drills

**Commit:** `git commit -m "phase 4 v2: expanded a1+a2 content"`

---

### **PHASE 5: Listening Practice Mode** (1 hour — built on top of Phase 1)

**Goal:** Listen to German audio, type what you heard, get graded.

**Tasks:**

1. **Build `app/practice/listen/page.tsx`:**
   - Select level (A1/A2/B1) → loads short audio prompts
   - Source: use existing reading passages, broken into sentences
   - Play audio (TTS) → user types what they heard
   - Compare to original → score
   - Show original + translation
   - Award 15 XP per correct sentence

2. **Build `components/ListenAndType.tsx`:**
   - Audio player at top
   - "Play" / "Repeat" / "Slower" (rate 0.7) / "Show transcript" buttons
   - Text input for user's transcription
   - "Check" button → compares with normalization (case-insensitive, ignore punctuation, ignore extra spaces)
   - Visual diff: highlight added/missing/wrong words

3. **Add Listening card to `app/practice/page.tsx`:**
   - Below the existing 3 cards (Translate, Read, Chat)
   - Icon: Lucide `Headphones`
   - Subtitle: "Train your ear. Type what you hear."

**Verification:**
- [ ] Audio plays clearly
- [ ] Can replay multiple times
- [ ] Diff display is helpful
- [ ] Slower mode actually slows audio (rate 0.7)

**Commit:** `git commit -m "phase 5 v2: listening practice mode"`

---

### **PHASE 6: Writing Practice** (3-4 hours) **— DEFER IF OVER 12 HOURS TOTAL**

**Goal:** User writes a German essay or paragraph → AI gives detailed feedback.

**⚠️ HARD GATE:** Before starting Phase 6, check elapsed time. If you've already spent 12+ hours on Phases 1-5, **STOP** and commit a "v2 partial" milestone. Ask the user whether to continue or defer Phase 6 to v3. Do NOT push through if it'll break other features.

**Tasks (if proceeding):**

1. **Create `content/writing-prompts/a2.json` and `b1.json`:**
   - 20 prompts each
   - Format: `{ id, level, topic, prompt, suggestedLength, hints }`
   - Example A2 prompt: *"Schreiben Sie über Ihr letztes Wochenende. Was haben Sie gemacht? Mit wem? (60-80 Wörter)"*
   - Example B1 prompt: *"Sollten Smartphones in Schulen verboten werden? Diskutieren Sie Vor- und Nachteile. (150-200 Wörter)"*

2. **Build `app/practice/write/page.tsx`:**
   - Select level → see writing prompt
   - Multi-line textarea (resizable, character counter showing target range)
   - "Submit for feedback" button
   - During grading: skeleton loader
   - Feedback panel slides in below

3. **Build `app/api/grade-essay/route.ts`:**
   - POST `{ prompt, essay, level }`
   - Calls Gemini Flash with structured output (responseSchema)
   - Returns:
     ```typescript
     {
       overallScore: number;        // 0-10
       grammarScore: number;
       vocabularyScore: number;
       structureScore: number;
       coherenceScore: number;
       summary: string;             // 2-3 sentences of feedback
       strengths: string[];         // bullet points
       improvements: string[];      // bullet points
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
     }
     ```

4. **Build `components/WritingPad.tsx`:**
   - Textarea with German-keyboard helper buttons (ä, ö, ü, ß)
   - Auto-save draft to localStorage every 10s
   - Character counter with target range highlighted

5. **Build `components/EssayFeedback.tsx`:**
   - Visual radar chart or bar chart of 4 scores (Recharts)
   - Strengths section (green check icons)
   - Improvements section (yellow alert icons)
   - Corrections shown as before/after pairs
   - "Try another prompt" CTA

6. **Add Writing card to `app/practice/page.tsx`:**
   - Below other practice modes
   - Icon: Lucide `PenTool`
   - Subtitle: "Write essays. Get detailed AI feedback."

7. **Award XP:** 50 XP per essay submitted with score ≥ 6/10

**Verification:**
- [ ] Submit an A2 essay → get detailed feedback within 10 seconds
- [ ] Feedback is genuinely useful (test with a real A2-level essay)
- [ ] Corrections are accurate
- [ ] Mobile responsive (textarea + feedback panel)
- [ ] Drafts persist on browser refresh

**Commit:** `git commit -m "phase 6 v2: writing practice with ai feedback"`

---

### **PHASE 7: Polish, Test, Deploy** (1-2 hours)

**Goal:** Everything works in production. Ship.

**Tasks:**

1. **Update `README.md`** with new features:
   - Add screenshots/GIFs of new modes
   - Update feature list
   - Update roadmap (move new items to "Shipped")

2. **Add the new modes to navigation:**
   - Navbar: streak indicator + review queue indicator
   - Footer: link to all new modes

3. **Test on production after deploy:**
   - Click through every new mode end-to-end
   - Check console for errors on each route
   - Test on mobile (iPhone Safari + Android Chrome)
   - Verify audio works in all browsers

4. **Final commit + push:**
   ```bash
   git add .
   git commit -m "v2 polish + deploy"
   git push
   ```

5. **Verify Vercel deploys cleanly.** Wait 2 minutes, then test the live URL.

**Verification:**
- [ ] https://deutsch-easy.vercel.app/practice/review works
- [ ] https://deutsch-easy.vercel.app/practice/listen works
- [ ] https://deutsch-easy.vercel.app/practice/write works (if Phase 6 was built)
- [ ] All audio buttons function
- [ ] B1 selectable
- [ ] No regressions in v1 features (drills, readings, chat, progress)
- [ ] Mobile responsive
- [ ] Lighthouse score on home page: 90+ Performance

---

## 🚨 CRITICAL ENGINEERING RULES (Same As v1)

1. **Pin all NEW dependency versions exactly.**
2. **Do NOT change existing dependencies** unless absolutely necessary.
3. **Do NOT rewrite v1 files** — extend them.
4. **Commit after each phase.** Use the commit messages provided.
5. **Test in dev before pushing.** Then test in production after pushing.
6. **localStorage SSR safety:** all reads in `useEffect`, never at component top level.
7. **No scope creep.** Features beyond this spec are v3.
8. **Hard time-checkpoint after Phase 5:** If >12 hours elapsed, ask user about Phase 6.

---

## 🛑 BLOCKER PROTOCOL

If you hit a blocker:

1. **Spend max 15 minutes debugging.**
2. **If stuck:** Document the exact error, what you tried, what you suspect. Stop and ask user.
3. **Common v2-specific blockers:**
   - **Web Speech API not working on Safari:** Safari requires user gesture before first speech. Solution: trigger on click only, never auto-play.
   - **Voices array empty on first call:** Listen to `voiceschanged` event, retry voice selection there.
   - **SRS dates off-by-one:** Use UTC dates consistently, format `YYYY-MM-DD`, compare strings not Date objects.
   - **localStorage quota exceeded:** Old vocabulary lookup history can fill it. Add cleanup: keep only last 500 entries.

---

## 📋 V2 SUCCESS CRITERIA

V2 is "done" when:

1. ✅ Audio works on every German word in popovers
2. ✅ Audio works on full reading passages
3. ✅ SRS queue auto-populates from word lookups
4. ✅ Daily review screen functional with SM-2 scheduling
5. ✅ B1 selectable with real content
6. ✅ 100+ new drills total (A1: +30, A2: +30, B1: +40)
7. ✅ 15+ new readings (A1: +5, A2: +5, B1: +5)
8. ✅ Listening mode functional
9. ✅ (Stretch) Writing mode functional
10. ✅ Live URL works, no regressions on v1
11. ✅ Mobile responsive on all new pages
12. ✅ README updated

---

## 🎯 GO

**Execute in this exact order:**

1. Phase 1: TTS audio (2-3h)
2. Phase 2: Spaced repetition (3-4h)
3. Phase 3: B1 unlock (1-2h)
4. Phase 4: Expand A1/A2 content (1-2h)
5. Phase 5: Listening mode (1h)
6. **Time check — if 12+ hrs elapsed, ASK before Phase 6**
7. Phase 6: Writing practice (3-4h)
8. Phase 7: Polish + deploy (1-2h)

After each phase: verify checklist, commit, continue.

**Begin now with Phase 1.**
