-- ─── Supabase pgvector setup ────────────────────────────────────────────────
-- Run this file in the Supabase SQL editor to create the vector store used
-- by the Interactive Resume Assistant.
--
-- Steps:
--   1. Open your Supabase project → SQL Editor
--   2. Paste and run this file
--   3. Run `npm run ingest` locally to populate the table with embedded chunks
--
-- Re-running this file is safe: all statements use IF NOT EXISTS / OR REPLACE.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable the pgvector extension (no-op if already enabled)
create extension if not exists vector;

-- ─── Table ───────────────────────────────────────────────────────────────────

create table if not exists public.resume_chunks (
  id               text    primary key,
  chunk_type       text    not null,
  title            text    not null,
  text             text    not null,
  source_record_id text    not null,
  source_status    text    not null,
  public_safe      boolean not null default true,
  tags             text[]  not null default '{}',
  priority         integer not null default 0,
  -- 1536 dimensions matches text-embedding-3-small.
  -- Change to 3072 if you switch to text-embedding-3-large.
  embedding        vector(1536)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Filter index: speeds up the public_safe WHERE clause in the RPC
create index if not exists resume_chunks_public_safe_idx
  on public.resume_chunks (public_safe);

-- ANN index for cosine similarity search.
--
-- HNSW (recommended for Supabase hosted plans — better recall, no training phase):
create index if not exists resume_chunks_embedding_hnsw_idx
  on public.resume_chunks using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- IVFFlat alternative (requires rows before building; good for self-hosted Postgres):
-- Uncomment and adjust `lists` based on chunk count (sqrt(chunk_count) is a
-- reasonable starting point; typical resume KB is 40-100 chunks so lists=10 is fine).
--
-- create index if not exists resume_chunks_embedding_ivfflat_idx
--   on public.resume_chunks using ivfflat (embedding vector_cosine_ops)
--   with (lists = 10);

-- ─── RPC function ─────────────────────────────────────────────────────────────

-- match_resume_chunks: semantic similarity search used by /api/chat.
-- Called via the Supabase REST API: POST /rest/v1/rpc/match_resume_chunks
--
-- Parameters:
--   query_embedding   vector(1536)  — embedding of the user question
--   match_count       integer       — max results to return (default 6)
--   filter_public_safe boolean      — when true, exclude non-public-safe chunks

create or replace function public.match_resume_chunks(
  query_embedding    vector(1536),
  match_count        integer default 6,
  filter_public_safe boolean default true
)
returns table (
  id               text,
  chunk_type       text,
  title            text,
  text             text,
  source_record_id text,
  source_status    text,
  public_safe      boolean,
  tags             text[],
  priority         integer,
  similarity       double precision
)
language sql
stable
as $$
  select
    rc.id,
    rc.chunk_type,
    rc.title,
    rc.text,
    rc.source_record_id,
    rc.source_status,
    rc.public_safe,
    rc.tags,
    rc.priority,
    1 - (rc.embedding <=> query_embedding) as similarity
  from public.resume_chunks rc
  where (not filter_public_safe or rc.public_safe = true)
    and rc.embedding is not null
  order by rc.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- ─── Row-level security (optional but recommended) ───────────────────────────
-- Uncomment to restrict direct table access to service-role key only.
-- The match_resume_chunks RPC is callable with the anon key regardless.
--
-- alter table public.resume_chunks enable row level security;
--
-- create policy "Service role full access"
--   on public.resume_chunks
--   for all
--   using (auth.role() = 'service_role');
