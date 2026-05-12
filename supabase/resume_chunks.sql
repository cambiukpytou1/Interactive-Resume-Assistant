create extension if not exists vector;

create table if not exists public.resume_chunks (
  id text primary key,
  chunk_type text not null,
  title text not null,
  text text not null,
  source_record_id text not null,
  source_status text not null,
  public_safe boolean not null default true,
  tags text[] not null default '{}',
  priority integer not null default 0,
  embedding vector(1536)
);

create index if not exists resume_chunks_public_safe_idx
  on public.resume_chunks (public_safe);

create index if not exists resume_chunks_embedding_idx
  on public.resume_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_resume_chunks(
  query_embedding vector(1536),
  match_count integer default 6,
  filter_public_safe boolean default true
)
returns table (
  id text,
  chunk_type text,
  title text,
  text text,
  source_record_id text,
  source_status text,
  public_safe boolean,
  tags text[],
  priority integer,
  similarity double precision
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
