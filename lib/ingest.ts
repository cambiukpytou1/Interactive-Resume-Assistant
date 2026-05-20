/**
 * lib/ingest.ts
 *
 * Shared ingestion logic: embed a batch of retrieval chunks and upsert them
 * into the Supabase resume_chunks table.
 *
 * Used by:
 *   - scripts/ingest.ts  (standalone CLI runner)
 *   - app/api/reindex/route.ts  (on-demand rebuild endpoint)
 *
 * The caller is responsible for supplying chunks and the resolved config values.
 * This module never reads process.env directly so it can be safely tested and
 * called from both Node.js scripts and Next.js API routes.
 */

import { RetrievalChunk } from '@/lib/types';

export type IngestConfig = {
  openaiApiKey: string;
  openaiEmbeddingModel: string;
  supabaseUrl: string;
  supabaseKey: string;
};

export type IngestResult = {
  attempted: number;
  succeeded: number;
  skipped: number;
  errors: string[];
};

// ─── OpenAI embeddings ───────────────────────────────────────────────────────

async function embedText(text: string, config: IngestConfig): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // stay well within 8k token limit
        model: config.openaiEmbeddingModel
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`OpenAI embeddings error ${response.status}: ${body.slice(0, 200)}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };

    return payload.data?.[0]?.embedding ?? null;
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}

// ─── Supabase upsert ─────────────────────────────────────────────────────────

async function upsertChunk(chunk: RetrievalChunk, embedding: number[], config: IngestConfig): Promise<void> {
  const row = {
    id: chunk.id,
    chunk_type: chunk.chunkType,
    title: chunk.title,
    text: chunk.text,
    source_record_id: chunk.sourceRecordId,
    source_status: chunk.sourceStatus,
    public_safe: chunk.publicSafe,
    tags: chunk.tags,
    priority: chunk.priority,
    embedding
  };

  const response = await fetch(`${config.supabaseUrl}/rest/v1/resume_chunks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
      apikey: config.supabaseKey,
      Authorization: `Bearer ${config.supabaseKey}`
    },
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Supabase upsert error ${response.status} for chunk "${chunk.id}": ${body.slice(0, 200)}`);
  }
}

// ─── Batch ingest ─────────────────────────────────────────────────────────────

/**
 * Embed and upsert each chunk sequentially to avoid rate-limit spikes.
 * On individual chunk errors the function records the error and continues
 * so a single bad chunk does not abort the entire run.
 */
export async function ingestChunks(
  chunks: RetrievalChunk[],
  config: IngestConfig,
  onProgress?: (index: number, total: number, chunkId: string, ok: boolean) => void
): Promise<IngestResult> {
  const result: IngestResult = {
    attempted: chunks.length,
    succeeded: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Only ingest public-safe chunks — hard guardrail
    if (!chunk.publicSafe) {
      result.skipped++;
      onProgress?.(i, chunks.length, chunk.id, false);
      continue;
    }

    try {
      const embedding = await embedText(chunk.text, config);
      if (!embedding) {
        throw new Error('Received null embedding from OpenAI');
      }
      await upsertChunk(chunk, embedding, config);
      result.succeeded++;
      onProgress?.(i, chunks.length, chunk.id, true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`[${chunk.id}] ${message}`);
      onProgress?.(i, chunks.length, chunk.id, false);
    }
  }

  return result;
}

// ─── Config resolution helper ─────────────────────────────────────────────────

/**
 * Resolve IngestConfig from environment variables.
 * Returns null with a reason string if any required variable is missing.
 */
export function resolveIngestConfig(): { config: IngestConfig; error: null } | { config: null; error: string } {
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() ?? '';
  const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || '';
  const openaiEmbeddingModel =
    process.env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small';

  const missing: string[] = [];
  if (!openaiApiKey) missing.push('OPENAI_API_KEY');
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    return {
      config: null,
      error: `Missing required environment variables for ingestion: ${missing.join(', ')}`
    };
  }

  return {
    config: { openaiApiKey, openaiEmbeddingModel, supabaseUrl, supabaseKey },
    error: null
  };
}
