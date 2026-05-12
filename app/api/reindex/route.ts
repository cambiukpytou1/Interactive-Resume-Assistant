import { NextResponse } from 'next/server';
import { loadResumeData } from '@/lib/data';
import { buildRetrievalChunks, saveRetrievalArtifacts } from '@/lib/chunks';

export async function POST() {
  const data = await loadResumeData();
  const chunks = buildRetrievalChunks(data);
  const manifest = await saveRetrievalArtifacts(chunks);

  return NextResponse.json({
    status: 'ok',
    chunk_count: chunks.length,
    manifest
  });
}
