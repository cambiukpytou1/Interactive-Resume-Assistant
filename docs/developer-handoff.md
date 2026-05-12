# Developer Handoff

## Objective
Build a polished interactive resume web app with an AI chat that answers questions about Igor Yezhov's resume using only approved, public-safe knowledge.

## Product Scope
- Public resume dashboard
- AI interview assistant grounded in approved data
- Downloadable resume PDF
- Guardrails against overclaiming, consulting-bot drift, or disclosure of restricted information

## Recommended Stack
- Next.js App Router
- Tailwind + shadcn/ui
- Vercel deployment
- Supabase Postgres + pgvector
- Embeddings via `text-embedding-3-small`

## Recommended Repo Layout
- `app/` for UI and API routes
- `components/` for hero, timeline, skills, projects, chat panel
- `data/canonical/` for approved source of truth
- `data/staging/` for future seed additions
- `data/generated/` for chunking and index manifests
- `lib/` for loaders, retrieval, embeddings, guardrails, citations, answer validation
- `scripts/` for chunk building, indexing, validation, and evals

## Chat Behavior Requirements
- Use only canonical, public-safe content
- Exclude anything in `needs-confirmation.json`
- Distinguish hands-on vs conceptual vs evaluated vs restricted
- Refuse proprietary or client-sensitive detail requests
- Keep most answers concise and recruiter-friendly

## Retrieval Rules
- Retrieve only from canonical data
- Filter out records with `source_status=needs_confirmation` or `public_safe=false`
- Prefer role, project, and Q&A chunks
- Add guardrail chunks to generation context

## Suggested API Endpoints
- `POST /api/chat`
- `POST /api/reindex`
- `GET /api/health`

## Suggested Answer Payload
```json
{
  "answer": "string",
  "answer_status": "answered | not_in_kb | refused_guardrail",
  "citations": [
    { "label": "RSM experience", "source_record_id": "role_rsm_2020_present" }
  ]
}
```

## Build Order
1. Implement canonical data loading
2. Build dashboard UI
3. Add chat panel shell and `/api/chat`
4. Add retrieval chunk generation
5. Add embeddings and pgvector indexing
6. Add guardrail middleware and answer validation
7. Run recruiter and adversarial Q&A tests
8. Deploy to Vercel
