/**
 * lib/generate.ts
 *
 * LLM generation layer: takes retrieved chunks + the recruiter's question,
 * calls GPT-4o-mini, and returns a fluent, grounded, recruiter-friendly answer.
 *
 * Guardrail contract:
 *   - The system prompt prohibits invention, PII, and restricted claims.
 *   - Only public-safe chunks are ever passed in (enforced upstream).
 *   - If the API call fails for any reason, returns null so the caller can
 *     fall back to the existing rule-based chunk-stitching path.
 */

import { RetrievalChunk } from '@/lib/types';

const SYSTEM_PROMPT = `You are a professional resume assistant presenting approved career information for a candidate referred to only as "I.Y."

STRICT RULES — follow every one without exception:
1. Answer ONLY from the knowledge chunks provided in the user message. Do not add, invent, or infer any detail not present in the chunks.
2. Never reveal the candidate's real name, email address, phone number, home city, or any other personally identifiable information. Always refer to the candidate as "I.Y."
3. Do not claim external production AI deployment, deep ML engineering expertise, or expert Python development depth.
4. Do not disclose proprietary prompts, confidential client names, internal templates, or firm-specific methodologies.
5. Clearly distinguish hands-on experience from team-led, conceptual, evaluated, or internal-only work when the distinction is present in the chunks.
6. Keep answers concise and recruiter-friendly — typically 2-4 sentences. Do not pad or over-explain.
7. If the chunks do not contain enough information to answer the question, say exactly: "I do not have that detail in the approved resume knowledge base."
8. Do not mention that you are an AI, that you are using chunks, or refer to any internal system details.`;

function buildContext(chunks: RetrievalChunk[]): string {
  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.title}\n${chunk.text}`)
    .join('\n\n');
}

export async function generateAnswer(
  question: string,
  chunks: RetrievalChunk[]
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || chunks.length === 0) return null;

  const context = buildContext(chunks);
  const userMessage = `Resume knowledge base excerpts:\n\n${context}\n\n---\nRecruiter question: ${question}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.2,      // low temperature = factual, consistent answers
        max_tokens: 300,       // keeps answers concise
        frequency_penalty: 0.1 // slight nudge against repetition
      })
    });

    if (!response.ok) return null;

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = payload.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
