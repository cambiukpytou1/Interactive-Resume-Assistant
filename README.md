# Interactive Resume Assistant

Interactive Resume Assistant is a build-ready Next.js application for presenting Igor Yezhov's public-safe resume knowledge as a recruiter-friendly dashboard with grounded chat, retrieval artifacts, and deployment scaffolding for a future embeddings + pgvector upgrade.

## Current state

The app already includes:
- a polished resume dashboard with hero, positioning, experience, projects, and skills
- recruiter prompt shortcuts and an interactive chat panel
- a working `/api/chat`, `/api/health`, and `/api/reindex` API surface
- canonical knowledge files under `data/canonical`
- runtime retrieval chunk generation under `data/generated`
- optional vector-retrieval hooks that can be enabled later with OpenAI + Supabase environment variables

By default, the app works locally with rule-based retrieval only. When the optional environment variables are configured, the same API contract can layer in vector retrieval with fallback to the local retrieval logic.

## Repository structure

```text
app/                  Next.js app router pages and API routes
components/           Dashboard UI components
lib/                  Data loading, retrieval, chat, config, vector hooks
data/canonical/       Approved public-safe source data
data/generated/       Generated retrieval artifacts
data/staging/         Intake templates for future content additions
docs/                 Build, deployment, and handoff notes
supabase/             SQL setup for vector-ready storage and matching
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to test the dashboard.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```

`lint` currently maps to the same TypeScript verification command as `typecheck`, which keeps the repo usable without introducing an ESLint setup yet.

## Environment variables

Copy `.env.example` to `.env.local` and fill in only what you need.

### Required for local dashboard
No secrets are required for the default rule-based mode.

### Optional for vector retrieval
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL` (default: `text-embedding-3-small`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
- `SUPABASE_RETRIEVAL_RPC` (default: `match_resume_chunks`)

If these are present, `/api/chat` will try vector retrieval first and then fall back to the existing rule-based retrieval path.

## Health and API endpoints

- `GET /api/health` — runtime readiness and retrieval-mode summary
- `POST /api/chat` — recruiter-style grounded Q&A
- `POST /api/reindex` — rebuilds retrieval artifacts from canonical data

## Deployment

The app is ready for a simple Vercel deployment in rule-based mode today. Vector retrieval can be added later without changing the front-end contract. See [`docs/deployment.md`](docs/deployment.md) and [`supabase/resume_chunks.sql`](supabase/resume_chunks.sql).

## Near-term build path

1. deploy the current dashboard to Vercel
2. provision Supabase pgvector storage
3. sync retrieval chunks into Supabase
4. enable OpenAI embeddings for semantic retrieval
5. keep the current guardrails and fallback path in place for safe degradation

## Source control

GitHub repository: <https://github.com/cambiukpytou1/Interactive-Resume-Assistant>
