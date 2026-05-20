/**
 * lib/generate.ts
 *
 * LLM generation layer: takes retrieved chunks + the recruiter's question,
 * calls the NVIDIA NIM API (OpenAI-compatible) using z-ai/glm-5.1,
 * and returns a fluent, grounded, recruiter-friendly answer.
 *
 * Falls back to rule-based chunk-stitching if the API call fails for any reason.
 *
 * Guardrail contract:
 *   - The system prompt prohibits invention, PII, and restricted claims.
 *   - Only public-safe chunks are ever passed in (enforced upstream).
 */

import { RetrievalChunk } from '@/lib/types';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'z-ai/glm-5.1';

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
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey || chunks.length === 0) return null;

  const context = buildContext(chunks);
  const userMessage = `Resume knowledge base excerpts:\n\n${context}\n\n---\nRecruiter question: ${question}`;

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 1,
        top_p: 1,
        max_tokens: 1024,
        stream: false,
        // Enable thinking but strip it from the final output
        extra_body: {
          chat_template_kwargs: {
            enable_thinking: true,
            clear_thinking: true   // clears <think>…</think> from the response
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[generate] NVIDIA API error:', response.status, err);
      return null;
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = payload.choices?.[0]?.message?.content?.trim() ?? '';

    // Strip any residual <think>…</think> blocks just in case
    const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return text.length > 0 ? text : null;
  } catch (err) {
    console.error('[generate] Unexpected error:', err);
    return null;
  }
}
