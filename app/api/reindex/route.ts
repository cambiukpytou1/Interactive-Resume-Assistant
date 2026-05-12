import { NextRequest, NextResponse } from 'next/server';
import { loadResumeData } from '@/lib/data';
import { buildRetrievalChunks, saveRetrievalArtifacts } from '@/lib/chunks';
import { getRuntimeConfig } from '@/lib/config';
import { ingestChunks, resolveIngestConfig } from '@/lib/ingest';

/**
 * POST /api/reindex
 *
 * Rebuilds local retrieval artifacts from canonical data.
 * When OpenAI + Supabase are configured, also re-embeds and upserts every
 * public-safe chunk into Supabase so vector retrieval stays current.
 *
 * Protection:
 *   If REINDEX_SECRET is set, the request must include:
 *     Authorization: Bearer <secret>
 *   Without the header the endpoint returns 401.
 *   In local development (NODE_ENV !== 'production') the secret check is
 *   skipped so rebuilds can be triggered without any extra setup.
 */
export async function POST(request: NextRequest) {
  // ── Secret check (production only) ────────────────────────────────────────
  const reindexSecret = process.env.REINDEX_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && reindexSecret) {
    const authHeader = request.headers.get('Authorization') ?? '';
    const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (provided !== reindexSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ── Rebuild local artifacts ────────────────────────────────────────────────
  const data = await loadResumeData();
  const chunks = buildRetrievalChunks(data);
  const manifest = await saveRetrievalArtifacts(chunks);

  // ── Optional Supabase ingestion ────────────────────────────────────────────
  const runtime = getRuntimeConfig();
  let ingestResult: {
    attempted: number;
    succeeded: number;
    skipped: number;
    errors: string[];
  } | null = null;

  if (runtime.vectorRetrievalEnabled) {
    const { config, error: configError } = resolveIngestConfig();
    if (config) {
      try {
        ingestResult = await ingestChunks(chunks, config);
      } catch (err) {
        // Non-fatal: local rebuild already succeeded, report the failure in the response
        ingestResult = {
          attempted: chunks.length,
          succeeded: 0,
          skipped: 0,
          errors: [err instanceof Error ? err.message : String(err)]
        };
      }
    } else {
      // vectorRetrievalEnabled but config is missing — should not happen in normal flow
      ingestResult = {
        attempted: 0,
        succeeded: 0,
        skipped: 0,
        errors: [configError ?? 'Unknown config error']
      };
    }
  }

  return NextResponse.json({
    status: 'ok',
    chunk_count: chunks.length,
    manifest,
    vector_ingestion: ingestResult
      ? {
          attempted: ingestResult.attempted,
          succeeded: ingestResult.succeeded,
          skipped: ingestResult.skipped,
          error_count: ingestResult.errors.length,
          errors: ingestResult.errors.slice(0, 10) // cap for response size
        }
      : null
  });
}
