'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
  label: string;
  source_record_id: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  answer_status?: 'answered' | 'not_in_kb' | 'refused_guardrail';
  retrieval_mode?: string;
  loading?: boolean;
}

const STARTER_PROMPTS = [
  'What kind of AI work has I.Y. actually done?',
  "Describe I.Y.'s governance and risk management background.",
  'What tools has I.Y. used most recently?',
  'Why is I.Y. a strong fit for enterprise AI transformation?',
  'What are I.Y.\'s most impressive projects?',
  'How large are the teams I.Y. has led?',
];

const STATUS_COLORS: Record<string, string> = {
  answered: 'text-emerald-600',
  not_in_kb: 'text-amber-600',
  refused_guardrail: 'text-red-500',
};

const MODE_LABELS: Record<string, string> = {
  rule_based: 'Rule-based',
  vector: 'Vector',
  hybrid: 'Vector + Fallback',
};

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-1">
      {[0, 0.15, 0.3].map((delay, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${delay}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 shadow-sm">
          {message.loading ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:font-mono">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata row */}
        {!message.loading && (message.answer_status || message.citations?.length) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {message.answer_status && (
              <span className={`text-xs font-medium ${STATUS_COLORS[message.answer_status] ?? 'text-slate-400'}`}>
                {message.answer_status === 'answered' && '✓ Answered from KB'}
                {message.answer_status === 'not_in_kb' && '⚠ Not in knowledge base'}
                {message.answer_status === 'refused_guardrail' && '🛡 Restricted by guardrails'}
              </span>
            )}
            {message.retrieval_mode && (
              <span className="text-xs text-slate-400">
                {MODE_LABELS[message.retrieval_mode] ?? message.retrieval_mode}
              </span>
            )}
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.citations.map((c) => (
                  <span
                    key={`${c.source_record_id}-${c.label}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 flex justify-end">
        <div className="max-w-[85%] bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm the interactive resume assistant for **I.Y.** — an Enterprise AI Workflow, Analytics & Governance leader with 16 years of experience.\n\nAsk me anything about their background, skills, projects, or career. I'll answer from the approved knowledge base and clearly flag anything that's outside it.",
      answer_status: 'answered',
      retrieval_mode: 'rule_based',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    const loadingMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const result = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsg.id
            ? {
                ...msg,
                content: result.answer ?? 'Sorry, something went wrong.',
                citations: result.citations,
                answer_status: result.answer_status,
                retrieval_mode: result.retrieval_mode,
                loading: false,
              }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsg.id
            ? {
                ...msg,
                content: 'There was a problem reaching the assistant. Please check your connection and try again.',
                answer_status: 'not_in_kb',
                loading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">IY</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">I.Y. — Resume Assistant</p>
              <p className="text-xs text-slate-500">Enterprise AI · Analytics · Governance</p>
            </div>
          </div>
          <Link
            href="/evaluate"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-full transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Job Fit
          </Link>
          <Link
            href="/resume"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} message={msg} />
            ) : (
              <AssistantMessage key={msg.id} message={msg} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Starter prompts — shown when only welcome message */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 pb-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-slate-500 mb-2 ml-1">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-full hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AI work, governance, skills, projects…"
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {isLoading ? (
                <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">Shift+Enter</kbd> for newline · Answers are grounded in the approved knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
