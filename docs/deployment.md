# Deployment guide

## 1) Local verification

```bash
npm install
npm run typecheck
npm run build
npm run start
```

Verify these endpoints respond correctly before deploying:
- `http://localhost:3000/` — dashboard loads
- `http://localhost:3000/api/health` — shows `status: ok` and `retrieval_mode: rule_based`
- `http://localhost:3000/api/chat` — POST with `{ "question": "..." }` returns a grounded answer

If `config_warnings` is non-empty in the health response you have a partial env var setup that needs attention before enabling vector retrieval.

---

## 2) Vercel deployment

This is a standard Next.js App Router project. Deploy directly from the GitHub repository via the Vercel dashboard or CLI.

### Minimum deployment (no secrets required)

Connect the repo to Vercel and deploy without setting any environment variables. The app runs in rule-based retrieval mode with full dashboard and chat functionality.

### Vector-enabled deployment

Add the following environment variables in **Vercel → Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Set to your production URL (e.g. `https://your-app.vercel.app`) |
| `OPENAI_API_KEY` | Yes (vector) | Used by `/api/chat` for query embedding and by `/api/reindex` for ingestion |
| `OPENAI_EMBEDDING_MODEL` | No | Default: `text-embedding-3-small` |
| `SUPABASE_URL` | Yes (vector) | Your Supabase project REST URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Write access for `/api/reindex`. Use over anon key for this endpoint. |
| `SUPABASE_ANON_KEY` | Alternative | Sufficient for read-only `/api/chat` if you split the keys |
| `SUPABASE_RETRIEVAL_RPC` | No | Default: `match_resume_chunks` |
| `REINDEX_SECRET` | Recommended | Protects `POST /api/reindex` with `Authorization: Bearer <secret>` |

Function timeout limits are set in `vercel.json`:
- `/api/reindex` — 60 s (ingestion can be slow for large chunk sets)
- `/api/chat` — 30 s
- `/api/health` — 10 s

---

## 3) Supabase setup

### 3a) Create the table and RPC

Open the **Supabase SQL editor** and run the contents of `supabase/resume_chunks.sql`.

This creates:
- `public.resume_chunks` table with a `vector(1536)` embedding column
- A cosine-similarity index for fast ANN search
- A `match_resume_chunks` RPC function used by `/api/chat`

### 3b) Ingest chunks with embeddings

After the table is created, run the ingestion script locally or from CI:

```bash
# Copy env template and fill in your Supabase + OpenAI credentials
cp .env.example .env.local
# Edit .env.local — set OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

npm run ingest
```

The script:
1. Loads canonical resume data from `data/canonical/`
2. Builds all retrieval chunks (same logic as the API)
3. Creates an OpenAI embedding for each public-safe chunk
4. Upserts the row into `resume_chunks` (safe to re-run — duplicates are merged)
5. Reports per-chunk progress and a final success/error summary

Re-run `npm run ingest` whenever canonical data changes (new roles, projects, Q&A, etc.).

### 3c) Verify ingestion

Check the Supabase table editor to confirm rows were inserted with non-null `embedding` values, then call `/api/health` to confirm `vector_retrieval_enabled: true`.

### 3d) On-demand reindex via API

In production you can also trigger a rebuild + ingestion via the API endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/reindex \
  -H "Authorization: Bearer $REINDEX_SECRET"
```

The response includes both the local rebuild manifest and a `vector_ingestion` summary with per-chunk error counts.

---

## 4) Retrieval behavior

| Condition | Behavior |
|---|---|
| No vector env vars | Rule-based keyword + intent retrieval only |
| OpenAI only, no Supabase | Rule-based only (config warning surfaced at `/api/health`) |
| Supabase only, no OpenAI | Rule-based only (config warning surfaced at `/api/health`) |
| Both configured | Vector retrieval first; falls back to rule-based if vector returns nothing |

Guardrails are enforced in all retrieval modes. The `/api/chat` endpoint always checks `isRestrictedQuestion()` before any retrieval.

---

## 5) Operational notes

- Canonical files in `data/canonical/` are the single source of truth. Never invent or add unverified claims.
- `data/generated/retrieval-chunks.json` is a committed baseline that the app uses as its initial chunk cache. It is regenerated on first request if missing.
- The staging files under `data/staging/` are intake templates. Move verified content to `data/canonical/` and run `npm run ingest` to activate it in retrieval.
- If Supabase or OpenAI become unavailable the app automatically degrades to rule-based mode without user-visible errors.
- `/api/reindex` is protected by `REINDEX_SECRET` in production. Without the secret the endpoint returns 401.
