# Deployment guide

## 1) Local verification

```bash
npm install
npm run build
npm run start
```

Verify:
- `/`
- `/api/health`
- `/api/chat`

## 2) Vercel deployment

This repository is a standard Next.js App Router project, so it can be deployed directly to Vercel.

### Minimum deployment
Set no secrets and deploy as-is. The app will run in rule-based retrieval mode.

### Optional vector-enabled deployment
Add the following environment variables in Vercel:
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
- `SUPABASE_RETRIEVAL_RPC`
- `NEXT_PUBLIC_SITE_URL`

## 3) Supabase setup

Use the SQL in `supabase/resume_chunks.sql` to create the vector-ready table and RPC function.

Suggested workflow:
1. create the table and RPC in Supabase SQL editor
2. export or insert the generated retrieval chunks from `data/generated/retrieval-chunks.json`
3. store embeddings for each chunk row
4. enable vector matching through the RPC function

## 4) Operational notes

- The UI and API already work without external services
- Guardrails should remain active in all retrieval modes
- If vector services fail, the app should continue answering through local rule-based retrieval
