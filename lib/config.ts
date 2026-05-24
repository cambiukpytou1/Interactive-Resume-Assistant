import { RetrievalMode } from '@/lib/types';

export type RuntimeConfigSummary = {
  environment: string;
  siteUrl: string | null;
  openaiConfigured: boolean;   // kept for interface compat — now reflects NVIDIA key
  nvidiaConfigured: boolean;
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

function detectConfigWarnings(
  nvidiaConfigured: boolean,
  supabaseConfigured: boolean
): string[] {
  const warnings: string[] = [];

  if (nvidiaConfigured && !supabaseConfigured) {
    warnings.push(
      'NVIDIA_API_KEY is set but SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing. ' +
        'Vector retrieval will not activate. Add Supabase variables to enable it.'
    );
  }

  if (readOptionalEnv('SUPABASE_URL') && !readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') && !readOptionalEnv('SUPABASE_ANON_KEY')) {
    warnings.push(
      'SUPABASE_URL is set but neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is present. ' +
        'Supabase calls will fail. Provide at least one key.'
    );
  }

  if (!readOptionalEnv('SUPABASE_URL') && (readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || readOptionalEnv('SUPABASE_ANON_KEY'))) {
    warnings.push(
      'A Supabase key is set but SUPABASE_URL is missing. ' +
        'Supabase calls will fail. Add SUPABASE_URL to complete the configuration.'
    );
  }

  if (supabaseConfigured && !nvidiaConfigured) {
    warnings.push(
      'Supabase is configured but NVIDIA_API_KEY is missing. ' +
        'Embeddings cannot be created. Add NVIDIA_API_KEY to enable vector retrieval.'
    );
  }

  return warnings;
}

export function getRuntimeConfig(): RuntimeConfigSummary {
  const siteUrl = readOptionalEnv('NEXT_PUBLIC_SITE_URL');
  const nvidiaConfigured = Boolean(readOptionalEnv('NVIDIA_API_KEY'));
  const supabaseConfigured = Boolean(
    readOptionalEnv('SUPABASE_URL') &&
      (readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || readOptionalEnv('SUPABASE_ANON_KEY'))
  );
  const vectorRetrievalEnabled = nvidiaConfigured && supabaseConfigured;
  const configWarnings = detectConfigWarnings(nvidiaConfigured, supabaseConfigured);

  return {
    environment: process.env.NODE_ENV ?? 'development',
    siteUrl,
    openaiConfigured: nvidiaConfigured,   // alias for backward compat
    nvidiaConfigured,
    supabaseConfigured,
    vectorRetrievalEnabled,
    embeddingModel: readOptionalEnv('EMBEDDING_MODEL') ?? 'text-embedding-3-small',
    retrievalMode: vectorRetrievalEnabled ? 'hybrid' : 'rule_based',
    configWarnings
  };
}
