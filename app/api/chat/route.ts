import { NextRequest, NextResponse } from 'next/server';
import { buildChunkAnswer, buildGuardrailRefusal, answerQuestion, isRestrictedQuestion } from '@/lib/chat';
import { getRuntimeConfig } from '@/lib/config';
import { ensureRetrievalArtifacts, loadResumeData } from '@/lib/data';
import { matchVectorChunks } from '@/lib/vector';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question : '';

  if (!question.trim()) {
    return NextResponse.json(
      {
        answer: 'Please provide a question.',
        answer_status: 'not_in_kb',
        citations: [],
        retrieval_mode: 'rule_based'
      },
      { status: 400 }
    );
  }

  const runtime = getRuntimeConfig();
  await ensureRetrievalArtifacts();
  const data = await loadResumeData();

  if (isRestrictedQuestion(question)) {
    return NextResponse.json(buildGuardrailRefusal(runtime.retrievalMode));
  }

  const vectorChunks = runtime.vectorRetrievalEnabled ? await matchVectorChunks(question, 6) : [];
  const vectorResult = vectorChunks.length > 0 ? buildChunkAnswer(vectorChunks, data.profile.id, 'hybrid') : null;

  if (vectorResult) {
    return NextResponse.json(vectorResult);
  }

  const result = answerQuestion(question, data, runtime.retrievalMode);
  return NextResponse.json(result);
}
