import { getRuntimeConfig } from '@/lib/config';
import { RetrievalChunk, RetrievalChunkType } from '@/lib/types';

type SupabaseMatchRow = {
  id?: string;
  chunk_type?: string;
  chunkType?: string;
  title?: string;
  text?: string;
  source_record_id?: string;
  sourceRecordId?: string;
  source_status?: string;
  sourceStatus?: string;
  public_safe?: boolean;
  publicSafe?: boolean;
  tags?: unknown;
  priority?: number;
};

function normalizeChunkType(input: string | undefined): RetrievalChunkType {
  const allowed: RetrievalChunkType[] = [
    'profile_summary',
    'profile_positioning',
    'role_summary',
    'role_highlight',
    'project_card',
    'skill_group',
    'interview_qa',
    'guardrail_rule'
  ];

  if (input && allowed.includes(input as RetrievalChunkType)) {
    return input as RetrievalChunkType;
  }

  return 'profile_summary';
}

function mapRowToChunk(row: SupabaseMatchRow): RetrievalChunk {
  const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];

  return {
    id: row.id ?? crypto.randomUUID(),
    chunkType: normalizeChunkType(row.chunk_type ?? row.chunkType),
    title: row.title ?? 'Retrieved chunk',
    text: row.text ?? '',
    sourceRecordId: row.source_record_id ?? row.sourceRecordId ?? 'unknown-source',
    sourceStatus: row.source_status ?? row.sourceStatus ?? 'unknown',
    publicSafe: row.public_safe ?? row.publicSafe ?? true,
    tags,
    priority: typeof row.priority === 'number' ? row.priority : 0
  };
}

async function createEmbedding(question: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: question,
      model: process.env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small'
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  return payload.data?.[0]?.embedding ?? null;
}

export async function matchVectorChunks(question: string, matchCount = 6): Promise<RetrievalChunk[]> {
  const config = getRuntimeConfig();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
  const rpcName = process.env.SUPABASE_RETRIEVAL_RPC?.trim() || 'match_resume_chunks';

  if (!config.vectorRetrievalEnabled || !supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const embedding = await createEmbedding(question);
    if (!embedding) {
      return [];
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_count: matchCount,
        filter_public_safe: true
      })
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as SupabaseMatchRow[];
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.map(mapRowToChunk).filter((chunk) => chunk.publicSafe && chunk.text.trim().length > 0);
  } catch {
    return [];
  }
}
