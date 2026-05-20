import { NextRequest, NextResponse } from 'next/server';
import { buildChunkAnswer, buildGuardrailRefusal, answerQuestion, isRestrictedQuestion } from '@/lib/chat';
import { getRuntimeConfig } from '@/lib/config';
import { ensureRetrievalArtifacts, loadResumeData } from '@/lib/data';
import { matchVectorChunks } from '@/lib/vector';
import { generateAnswer } from '@/lib/generate';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const { allowed, retryAfterSeconds } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        answer: 'Too many requests. Please wait a moment before asking another question.',
        answer_status: 'not_in_kb',
        citations: [],
        retrieval_mode: 'rule_based'
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) }
      }
    );
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const body = await request.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question.slice(0, 500) : '';

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

  // ── Guardrail check (always runs first, before any retrieval) ─────────────
  const runtime = getRuntimeConfig();
  if (isRestrictedQuestion(question)) {
    return NextResponse.json(buildGuardrailRefusal(runtime.retrievalMode));
  }

  // ── Load data ─────────────────────────────────────────────────────────────
  await ensureRetrievalArtifacts();
  const data = await loadResumeData();

  // ── Retrieval: vector first, rule-based fallback ──────────────────────────
  const vectorChunks = runtime.vectorRetrievalEnabled
    ? await matchVectorChunks(question, 6)
    : [];

  const chunks = vectorChunks.length > 0
    ? vectorChunks
    : (() => {
        const { retrieveChunks } = require('@/lib/retrieval') as typeof import('@/lib/retrieval');
        return retrieveChunks(question, data, 6);
      })();

  const retrievalMode = vectorChunks.length > 0 ? 'hybrid' : runtime.retrievalMode;

  // ── LLM generation (uses OpenAI when key is present) ─────────────────────
  if (chunks.length > 0 && runtime.openaiConfigured) {
    const generated = await generateAnswer(question, chunks);
    if (generated) {
      // Build citations from the chunks that grounded the answer
      const citations = chunks.slice(0, 3).map((c) => ({
        label: c.title,
        source_record_id: c.sourceRecordId
      }));
      return NextResponse.json({
        answer: generated,
        answer_status: 'answered',
        citations,
        retrieval_mode: retrievalMode
      });
    }
  }

  // ── Rule-based fallback: chunk stitching (no LLM needed) ─────────────────
  const result = answerQuestion(question, data, runtime.retrievalMode);
  return NextResponse.json(result);
}
