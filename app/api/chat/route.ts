import { NextRequest, NextResponse } from 'next/server';
import { ensureRetrievalArtifacts, loadResumeData } from '@/lib/data';
import { answerQuestion } from '@/lib/chat';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const question = typeof body?.question === 'string' ? body.question : '';

  if (!question.trim()) {
    return NextResponse.json(
      {
        answer: 'Please provide a question.',
        answer_status: 'not_in_kb',
        citations: []
      },
      { status: 400 }
    );
  }

  await ensureRetrievalArtifacts();
  const data = await loadResumeData();
  const result = answerQuestion(question, data);
  return NextResponse.json(result);
}
