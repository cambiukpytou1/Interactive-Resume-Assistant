import { RetrievalMode } from '@/lib/types';

export type RuntimeConfigSummary = {
  environment: string;
  siteUrl: string | null;
  openaiConfigured: boolean;
  supabaseConfigured: boolean;
  vectorRetrievalEnabled: boolean;
  embeddingModel: string;
  retrievalMode: RetrievalMode;
};

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getRuntimeConfig(): RuntimeConfigSummary {
  const siteUrl = readOptionalEnv('NEXT_PUBLIC_SITE_URL');
  const openaiConfigured = Boolean(readOptionalEnv('OPENAI_API_KEY'));
  const supabaseConfigured = Boolean(
    readOptionalEnv('SUPABASE_URL') && (readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY') || readOptionalEnv('SUPABASE_ANON_KEY'))
  );
  const vectorRetrievalEnabled = openaiConfigured && supabaseConfigured;

  return {
    environment: process.env.NODE_ENV ?? 'development',
    siteUrl,
    openaiConfigured,
    supabaseConfigured,
    vectorRetrievalEnabled,
    embeddingModel: readOptionalEnv('OPENAI_EMBEDDING_MODEL') ?? 'text-embedding-3-small',
    retrievalMode: vectorRetrievalEnabled ? 'hybrid' : 'rule_based'
  };
}
