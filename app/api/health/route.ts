import { NextResponse } from 'next/server';
import { getRuntimeConfig } from '@/lib/config';
import { ensureRetrievalArtifacts, loadResumeData } from '@/lib/data';

export async function GET() {
  const runtime = getRuntimeConfig();
  const [data, chunks] = await Promise.all([loadResumeData(), ensureRetrievalArtifacts()]);

  return NextResponse.json({
    status: 'ok',
    app: 'interactive-resume-assistant',
    environment: runtime.environment,
    retrieval_mode: runtime.retrievalMode,
    vector_retrieval_enabled: runtime.vectorRetrievalEnabled,
    openai_configured: runtime.openaiConfigured,
    supabase_configured: runtime.supabaseConfigured,
    embedding_model: runtime.embeddingModel,
    role_count: data.roles.length,
    project_count: data.projects.length,
    chunk_count: chunks.length,
    config_warnings: runtime.configWarnings,
    checked_at: new Date().toISOString()
  });
}
