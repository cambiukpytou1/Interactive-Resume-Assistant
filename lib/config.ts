import { RetrievalMode } from '@/lib/types';

export type RuntimeConfigSummary = {
  environment: string;
  siteUrl: string | null;
  openaiConfigured: boolean;
  supabaseConfigured: boolean;
  vectorRetrievalEnabled: boolean;
  embeddingModel: string;
  retrievalMode: RetrievalMode;
  configWarnings: string[];
};

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/**
 * Detect a "partial" vector config — the operator has set some but not all of
 * the required variables, which is almost always a misconfiguration rather than
 * an intentional choice to stay in rule-based mode.
 *
 * We surface these as configWarnings (visible in /api/health) so operators can
 * catch the problem without the app silently falling back and leaving them
 * wondering why vector retrieval isn't activating.
 */
function detectConfigWarnings(
  openaiConfigured: boolean,
  supabaseConfigured: boolean
): string[] {
  const warnings: string[] = [];

  const hasOpenAI = openaiConfigured;
  const hasSupabase = supabaseConfigured;

  // OpenAI key present but Supabase not configured
  if (hasOpenAI && !hasSupabase) {
    warnings.push(
      'OPENAI_API_KEY is set but SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing. ' +
        'Vector retrieval will not activate. Add Supabase variables to enable it.'
    );
  }

  // Supabase URL present but no auth key
  if (readOptionalEnv('SUPABASE_URL') && !readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') && !readOptionalEnv('SUPABASE_ANON_KEY')) {
    warnings.push(
      'SUPABASE_URL is set but neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is present. ' +
        'Supabase calls will fail. Provide at least one key.'
    );
  }

  // Supabase auth key present but no URL
  if (!readOptionalEnv('SUPABASE_URL') && (readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || readOptionalEnv('SUPABASE_ANON_KEY'))) {
    warnings.push(
      'A Supabase key is set but SUPABASE_URL is missing. ' +
        'Supabase calls will fail. Add SUPABASE_URL to complete the configuration.'
    );
  }

  // Supabase present but no OpenAI key for embeddings
  if (hasSupabase && !hasOpenAI) {
    warnings.push(
      'Supabase is configured but OPENAI_API_KEY is missing. ' +
        'Embeddings cannot be created. Add OPENAI_API_KEY to enable vector retrieval.'
    );
  }

  return warnings;
}

export function getRuntimeConfig(): RuntimeConfigSummary {
  const siteUrl = readOptionalEnv('NEXT_PUBLIC_SITE_URL');
  const openaiConfigured = Boolean(readOptionalEnv('OPENAI_API_KEY'));
  const supabaseConfigured = Boolean(
    readOptionalEnv('SUPABASE_URL') &&
      (readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || readOptionalEnv('SUPABASE_ANON_KEY'))
  );
  const vectorRetrievalEnabled = openaiConfigured && supabaseConfigured;
  const configWarnings = detectConfigWarnings(openaiConfigured, supabaseConfigured);

  return {
    environment: process.env.NODE_ENV ?? 'development',
    siteUrl,
    openaiConfigured,
    supabaseConfigured,
    vectorRetrievalEnabled,
    embeddingModel: readOptionalEnv('OPENAI_EMBEDDING_MODEL') ?? 'text-embedding-3-small',
    retrievalMode: vectorRetrievalEnabled ? 'hybrid' : 'rule_based',
    configWarnings
  };
}
