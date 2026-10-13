# MarkMyAnswer

Free, instant, examiner-style marking for **Edexcel GCSE Business (1BS0)** exam answers. Students pick a practice question (or paste their own), write an answer, and get:

- a mark, and the level reached for 6, 9 and 12-mark questions
- feedback against each assessment objective (AO1, AO2, AO3a, AO3b)
- what earned marks and how to get more
- one sentence from their answer rewritten to reach a higher level
- redraft and re-mark, with their score progression

No accounts. Marking is done by Claude via the Anthropic API.

## How it works

| File | Purpose |
|---|---|
| `src/lib/spec.ts` | Edexcel 1BS0 question types, tariffs, level descriptors and AOs (our own wording) |
| `src/lib/questions.ts` | Original practice questions and case studies |
| `src/lib/marker.ts` | Marking prompt and Claude call (structured output, prompt caching) |
| `src/lib/ratelimit.ts` | Per-visitor burst and daily limits plus a global daily cap |
| `src/app/api/mark/route.ts` | `POST /api/mark` |
| `src/app/Marker.tsx` | The student UI |

## Run locally

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm install
npm run dev
```

## Deploy (Vercel + Upstash)

1. Import the repo into Vercel (the Hobby plan is fine to start).
2. Add a free Upstash Redis database (Vercel Marketplace → Upstash) so `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
3. Add `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables.
4. Set a monthly spend limit in the Anthropic Console as a final safety net.
5. Point `markmyanswer.co.uk` at Vercel (Settings → Domains).

## Running costs

Marking uses `claude-haiku-5-5` at high effort, which costs well under 1p per answer (roughly £1 per 500 answers). The long system prompt is cached. `LIMIT_GLOBAL_PER_DAY` caps the daily bill.

For more accurate marking of long answers, set `MARKING_MODEL=claude-opus-5-5` and `MARKING_EFFORT=medium`. That costs roughly 3-4p per answer and also turns on server-side refusal fallback.

Not affiliated with or endorsed by Pearson Edexcel.
