'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  citations?: Array<{ label: string; source_record_id: string }>;
  answer_status?: 'answered' | 'not_in_kb' | 'refused_guardrail';
};

const starters = [
  'What kind of AI work has Igor actually done?',
  'How should Igor be positioned for enterprise AI transformation roles?',
  'What is Igor\'s governance background?',
  'What tools has Igor used recently?',
  'Has Igor deployed production AI externally?',
  'Why is Igor a fit for workflow orchestration roles?'
];

const statusLabel: Record<string, string> = {
  answered: 'Answered from approved KB',
  not_in_kb: 'Not in approved KB',
  refused_guardrail: 'Restricted by guardrails'
};

export function ChatPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Ask a recruiter-style question about Igor\'s approved resume knowledge base.',
      answer_status: 'answered'
    }
  ]);

  async function sendMessage(input?: string) {
    const prompt = (input ?? question).trim();
    if (!prompt || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const result = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.answer,
          citations: result.citations,
          answer_status: result.answer_status
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'There was a problem reaching the chat API. Try again after the local app is running.',
          answer_status: 'not_in_kb'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="chat" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">AI interview assistant</h2>
          <p className="section-subtitle">This iteration uses the approved canonical files with a stronger rule-based retrieval layer. It is still designed to be upgraded to embeddings plus pgvector next.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 sm:max-w-xs">
          Uses public-safe knowledge only and refuses restricted prompt or client-detail requests.
        </div>
      </div>
      <div className="panel p-5">
        <div className="flex flex-wrap gap-2">
          {starters.map((starter) => (
            <button
              key={starter}
              onClick={() => sendMessage(starter)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              {starter}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-4 rounded-2xl bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={message.role === 'user' ? 'inline-block max-w-[92%] rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white' : 'inline-block max-w-[92%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 shadow-sm'}>
                {message.text}
              </div>
              {message.answer_status ? (
                <div className="mt-2 text-xs font-medium text-slate-500">{statusLabel[message.answer_status]}</div>
              ) : null}
              {message.citations && message.citations.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {message.citations.map((citation) => (
                    <span key={`${citation.source_record_id}-${citation.label}`} className="rounded-full bg-slate-200 px-2 py-1">
                      {citation.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder="Ask about AI work, governance, fit, tools, or selected projects..."
            className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </div>
    </section>
  );
}
