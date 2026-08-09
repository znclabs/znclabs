# ZNC Labs

Two connected Next.js apps:

- **apps/media** (public, → media.znclabs.com) — ingests RSS news across categories and uses an LLM (Groq, free tier) to write original, source-attributed analysis articles. Never copies or "spins" source text.
- **apps/studio** (private, → studio.znclabs.com) — generates social-media image assets (Pollinations.ai, free) for each published article. Password-protected.

Shared Postgres/Storage backend: Supabase (free tier). Automation: a GitHub Actions scheduled workflow (`.github/workflows/pipeline.yml`) drives both apps every 45 minutes.

## Setup

1. Create a free [Supabase](https://supabase.com) project, run `supabase/migrations/0001_init.sql` in its SQL editor.
2. Create a free [Groq](https://console.groq.com) API key.
3. Copy `.env.example` to `.env.local` in `apps/media` and `apps/studio` and fill in the values.
4. `npm install` at the repo root, then `npm run dev:media` / `npm run dev:studio`.

## Automation

`automation/trigger-pipeline.mjs` calls the media ingest endpoint, then triggers studio image generation for each new article. GitHub Actions runs it on a schedule against the deployed URLs — see the workflow file for the required repo secrets.
