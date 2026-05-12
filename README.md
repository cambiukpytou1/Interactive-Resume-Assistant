# Interactive Resume Assistant

Interactive Resume Assistant is a production-ready Next.js application for presenting Igor Yezhov's public-safe resume knowledge as a recruiter-friendly dashboard with grounded chat, semantic vector retrieval, and safe rule-based fallback.

## Current state

The app includes:
- a polished resume dashboard with hero, positioning, experience, projects, and skills
- recruiter prompt shortcuts and an interactive chat panel
- a working `/api/chat`, `/api/health`, and `/api/reindex` API surface
- canonical knowledge files under `data/canonical`
- runtime retrieval chunk generation under `data/generated`
- rule-based retrieval that works today without any external services
- semantic vector retrieval via OpenAI embeddings + Supabase pgvector (activates when env vars are set)
- a standalone ingestion script (`scripts/ingest.ts`) that embeds and upserts all chunks into Supabase
- config-warning detection so partial env var setups are caught at the `/api/health` endpoint

By default the app works locally with rule-based retrieval only. When `OPENAI_API_KEY` and Supabase variables are configured the same API contract layers in semantic vector retrieval with automatic fallback to rule-based retrieval if vector calls fail or return nothing useful.

## Repository structure

```text
app/                  Next.js app router pages and API routes
  api/chat/           Grounded recruiter Q&A (rule-based or vector + fallback)
  api/health/         Runtime readiness check with config-warning output
  api/reindex/        Rebuild local artifacts + optional Supabase ingestion
components/           Dashboard UI components
lib/
  chat.ts             Answer building, guardrail enforcement, citation logic
  chunks.ts           Retrieval chunk construction from canonical data
  config.ts           Runtime config resolution with partial-config warnings
  data.ts             Canonical data loading and artifact management
  ingest.ts           Shared embed + Supabase upsert logic
  retrieval.ts        Rule-based keyword + intent retrieval
  types.ts            Shared TypeScript types
  vector.ts           OpenAI embedding + Supabase RPC match
data/canonical/       Approved public-safe source data
data/generated/       Generated retrieval artifacts (committed as baseline)
data/staging/         Intake templates for future content additions
docs/                 Build, deployment, and handoff notes
scripts/
  ingest.ts           CLI ingestion runner: embed all chunks → Supabase
supabase/
  resume_chunks.sql   Table DDL + pgvector index + match RPC
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to test the dashboard.
Open `http://localhost:3000/api/health` to verify the retrieval mode and any config warnings.

## Available scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run typecheck    # TypeScript check
npm run lint         # Same as typecheck (ESLint not yet configured)
npm run ingest       # Embed all chunks and upsert into Supabase
```

`npm run ingest` requires `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`) to be set in `.env.local`. Run it once after provisioning Supabase, and again whenever canonical data changes.

## Environment variables

Copy `.env.example` to `.env.local` and fill in only what you need.

### Required for local dashboard (no secrets needed)

None. The app runs in rule-based retrieval mode by default.

### Optional — vector retrieval

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | Creates embeddings for queries and ingestion |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `SUPABASE_URL` | — | Your Supabase project REST URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Write access for ingestion and reindex |
| `SUPABASE_ANON_KEY` | — | Read-only access (sufficient for `/api/chat`) |
| `SUPABASE_RETRIEVAL_RPC` | `match_resume_chunks` | RPC function name |

Both OpenAI and Supabase must be configured for vector retrieval to activate. If only one is set the app logs a warning via `/api/health` and continues in rule-based mode.

### Optional — endpoint protection

| Variable | Default | Purpose |
|---|---|---|
| `REINDEX_SECRET` | — | If set, `POST /api/reindex` requires `Authorization: Bearer <secret>` in production |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used for absolute URL generation |

## Health and API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Runtime readiness, retrieval mode, chunk count, config warnings |
| `/api/chat` | POST | Grounded recruiter Q&A |
| `/api/reindex` | POST | Rebuild local artifacts + optional Supabase ingestion |

### `/api/chat` request / response

```json
// POST /api/chat
{ "question": "What kind of AI work has Igor actually done?" }

// Response
{
  "answer": "He has worked on practical enterprise AI workflows...",
  "answer_status": "answered",
  "citations": [
    { "label": "RSM role summary", "source_record_id": "role_rsm_2020_present" }
  ],
  "retrieval_mode": "rule_based"
}
```

`answer_status` values: `answered` | `not_in_kb` | `refused_guardrail`
`retrieval_mode` values: `rule_based` | `vector` | `hybrid`

## Deployment

The app is ready for Vercel deployment today in rule-based mode. Vector retrieval can be added after provisioning Supabase without changing any front-end code.

See [`docs/deployment.md`](docs/deployment.md) for the full deployment walkthrough and [`supabase/resume_chunks.sql`](supabase/resume_chunks.sql) for the database setup.

## Near-term build path

1. ✅ Dashboard UI with hero, timeline, projects, skills, chat
2. ✅ `/api/chat` with rule-based retrieval and guardrails
3. ✅ Canonical data and retrieval chunk generation
4. ✅ Vector retrieval hooks wired into `/api/chat`
5. ✅ Ingestion script (`scripts/ingest.ts`) for embedding chunks into Supabase
6. ✅ `/api/reindex` pushes to Supabase when vector is configured
7. ✅ Config validation warnings surfaced at `/api/health`
8. ✅ Vercel deployment config (`vercel.json`)
9. ⬜ Deploy to Vercel and provision Supabase
10. ⬜ Run `npm run ingest` against production Supabase
11. ⬜ Validate semantic retrieval quality against recruiter prompts

## Source control

GitHub repository: <https://github.com/cambiukpytou1/Interactive-Resume-Assistant>
