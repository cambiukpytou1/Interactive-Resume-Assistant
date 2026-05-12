import { ResumeData, RetrievalChunk } from '@/lib/types';
import { buildRetrievalChunks } from '@/lib/chunks';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for', 'on', 'with', 'what', 'how', 'does', 'did', 'is', 'are', 'was', 'were', 'has', 'have', 'about', 'tell', 'me', 'igor', 'his', 'he', 'experience', 'background'
]);

export function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word));
}

function keywordScore(text: string, tokens: string[]) {
  const normalized = text.toLowerCase();
  return tokens.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
}

function detectIntent(question: string) {
  const q = question.toLowerCase();
  return {
    fit: /fit|position|best suited|why .* fit/.test(q),
    tools: /tool|stack|technology|platform|used recently|what has .* used/.test(q),
    governance: /governance|risk|controls|sox|nist|cobit|compliance/.test(q),
    ai: /ai|agent|workflow|llm|prompt|mcp|local llm|ollama|lm studio/.test(q),
    project: /project|built|example|system|migration|documentation|rfp|migrateiq|deqs/.test(q),
    years: /years|how long|total|overall/.test(q)
  };
}

function chunkTypeBoost(chunk: RetrievalChunk, intent: ReturnType<typeof detectIntent>) {
  let boost = chunk.priority;

  if (intent.fit && ['profile_positioning', 'interview_qa'].includes(chunk.chunkType)) boost += 6;
  if (intent.tools && ['role_summary', 'skill_group'].includes(chunk.chunkType)) boost += 5;
  if (intent.governance && ['role_summary', 'role_highlight', 'interview_qa'].includes(chunk.chunkType)) boost += 5;
  if (intent.ai && ['project_card', 'role_summary', 'interview_qa'].includes(chunk.chunkType)) boost += 6;
  if (intent.project && chunk.chunkType === 'project_card') boost += 7;
  if (intent.years && chunk.chunkType === 'profile_summary') boost += 7;

  return boost;
}

export function retrieveChunks(question: string, data: ResumeData, chunkLimit = 6) {
  const tokens = tokenize(question);
  const intent = detectIntent(question);
  const chunks = buildRetrievalChunks(data);

  return chunks
    .map((chunk) => ({
      chunk,
      score: keywordScore(`${chunk.title} ${chunk.text} ${chunk.tags.join(' ')}`, tokens) + chunkTypeBoost(chunk, intent)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, chunkLimit)
    .map((entry) => entry.chunk);
}
