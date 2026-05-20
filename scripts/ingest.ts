/**
 * scripts/ingest.ts
 *
 * Standalone CLI ingestion runner.
 *
 * Loads canonical resume data, builds retrieval chunks, and upserts each chunk
 * with its embedding into the Supabase resume_chunks table.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts
 *
 * Required environment variables (set in .env.local or export before running):
 *   OPENAI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (preferred over ANON_KEY for write operations)
 *
 * Optional:
 *   OPENAI_EMBEDDING_MODEL   (default: text-embedding-3-small)
 *
 * The script reads .env.local automatically when tsx is installed.
 * To load it manually: set -a && source .env.local && set +a
 *
 * Exit codes:
 *   0  All chunks ingested successfully (or with non-fatal per-chunk errors)
 *   1  Fatal: missing config or unrecoverable failure
 */

// Load .env.local when running directly with tsx
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';

loadDotenv({ path: resolve(process.cwd(), '.env.local') });

import { loadResumeData } from '@/lib/data';
import { buildRetrievalChunks } from '@/lib/chunks';
import { ingestChunks, resolveIngestConfig } from '@/lib/ingest';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

function log(msg: string) {
  process.stdout.write(msg + '\n');
}

function ok(msg: string) {
  log(`${GREEN}✓${RESET} ${msg}`);
}

function warn(msg: string) {
  log(`${YELLOW}⚠${RESET}  ${msg}`);
}

function fail(msg: string) {
  log(`${RED}✗${RESET} ${msg}`);
}

async function main() {
  log('');
  log(`${BOLD}Interactive Resume Assistant — Supabase chunk ingestion${RESET}`);
  log(DIM + '─'.repeat(58) + RESET);
  log('');

  // 1. Resolve config
  const { config, error: configError } = resolveIngestConfig();
  if (!config) {
    fail(configError!);
    log('');
    log('Copy .env.example to .env.local and fill in the required values.');
    process.exit(1);
  }
  ok(`OpenAI model : ${config.openaiEmbeddingModel}`);
  ok(`Supabase URL : ${config.supabaseUrl}`);
  log('');

  // 2. Load canonical data
  log('Loading canonical resume data…');
  let data;
  try {
    data = await loadResumeData();
  } catch (err) {
    fail(`Failed to load canonical data: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
  ok(`Loaded ${data.roles.length} roles, ${data.projects.length} projects`);

  // 3. Build chunks
  const chunks = buildRetrievalChunks(data);
  const publicChunks = chunks.filter((c) => c.publicSafe);
  ok(`Built ${publicChunks.length} public-safe chunks (${chunks.length - publicChunks.length} skipped as not public-safe)`);
  log('');

  // 4. Ingest with progress
  log(`Ingesting ${publicChunks.length} chunks into Supabase…`);
  log(DIM + 'Each dot = one chunk. Errors shown inline.' + RESET);
  log('');

  const startMs = Date.now();
  let lineLen = 0;

  const result = await ingestChunks(publicChunks, config, (index, total, chunkId, success) => {
    void total;
    void chunkId;
    if (success) {
      process.stdout.write(GREEN + '.' + RESET);
    } else {
      process.stdout.write(RED + 'E' + RESET);
    }
    lineLen++;
    if (lineLen === 60) {
      process.stdout.write(`  ${index + 1}\n`);
      lineLen = 0;
    }
  });

  if (lineLen > 0) {
    process.stdout.write('\n');
  }
  log('');

  const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);

  // 5. Report
  log(DIM + '─'.repeat(58) + RESET);
  ok(`Succeeded : ${result.succeeded} / ${result.attempted}`);
  if (result.skipped > 0) {
    warn(`Skipped   : ${result.skipped} (not public-safe)`);
  }
  if (result.errors.length > 0) {
    fail(`Errors    : ${result.errors.length}`);
    log('');
    for (const errMsg of result.errors) {
      log(`  ${RED}•${RESET} ${errMsg}`);
    }
  }
  log(`${DIM}Elapsed   : ${elapsedSec}s${RESET}`);
  log('');

  if (result.errors.length > 0) {
    warn('Ingestion completed with errors. Fix the issues above and re-run to retry failed chunks.');
    warn('Successfully ingested chunks are already stored and will not be re-embedded on re-run (upsert is safe).');
  } else {
    ok('All chunks ingested. Vector retrieval is ready in Supabase.');
  }
  log('');

  // Exit 0 even with per-chunk errors — the ingest is resumable.
  // Exit 1 only for unrecoverable failures (already handled above).
  process.exit(0);
}

main().catch((err) => {
  fail(`Unexpected fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
