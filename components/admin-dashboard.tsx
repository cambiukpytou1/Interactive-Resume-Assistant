'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Evaluation {
  id: string;
  created_at: string;
  job_title: string | null;
  company_hint: string | null;
  fit_score: number | null;
  visitor_ip: string | null;
  user_agent: string | null;
  job_description: string;
  recruiter_output: string;
  candidate_notes: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-400">No score</span>;
  const color =
    score >= 8 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : score >= 6 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      {score}/10
    </span>
  );
}

function DeviceType({ ua }: { ua: string | null }) {
  if (!ua) return <span className="text-slate-400">Unknown</span>;
  if (/mobile|android|iphone|ipad/i.test(ua)) return <span>📱 Mobile</span>;
  if (/tablet/i.test(ua)) return <span>📱 Tablet</span>;
  return <span>🖥 Desktop</span>;
}

export function AdminDashboard() {
  const [secret, setSecret] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [activeTab, setActiveTab] = useState<'recruiter' | 'candidate' | 'jd'>('candidate');

  // Auto-load from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('secret');
    if (s) {
      setSecret(s);
      setInputSecret(s);
    }
  }, []);

  useEffect(() => {
    if (secret) fetchEvaluations(secret);
  }, [secret]);

  async function fetchEvaluations(s: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/evaluations?secret=${encodeURIComponent(s)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load');
        return;
      }
      setEvaluations(data.evaluations ?? []);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSecret(inputSecret);
    // Update URL without reload
    window.history.replaceState({}, '', `?secret=${encodeURIComponent(inputSecret)}`);
  }

  // Stats
  const avgScore = evaluations.length
    ? Math.round(evaluations.filter(e => e.fit_score).reduce((s, e) => s + (e.fit_score ?? 0), 0) / evaluations.filter(e => e.fit_score).length * 10) / 10
    : null;
  const last7Days = evaluations.filter(e => Date.now() - new Date(e.created_at).getTime() < 7 * 86400000).length;

  if (!secret) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your admin secret to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={inputSecret}
              onChange={e => setInputSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 text-sm"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={!inputSecret}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">I.Y. — Job Evaluation Dashboard</p>
              <p className="text-xs text-slate-400">Private · Who's looking at your profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEvaluations(secret)}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to site</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => { setSecret(''); setInputSecret(''); setError(''); }}
              className="mt-3 text-sm text-red-600 underline">Try again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Evaluations', value: evaluations.length.toString(), icon: '📋' },
                { label: 'Last 7 Days', value: last7Days.toString(), icon: '📅' },
                { label: 'Avg Fit Score', value: avgScore !== null ? `${avgScore}/10` : '—', icon: '🎯' },
                { label: 'Unique IPs', value: new Set(evaluations.map(e => e.visitor_ip)).size.toString(), icon: '🌐' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {evaluations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                <p className="text-4xl mb-3">👀</p>
                <p className="text-slate-600 font-medium">No evaluations yet</p>
                <p className="text-slate-400 text-sm mt-1">When someone runs a Job Fit evaluation, it will appear here.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${selected ? 'lg:grid-cols-[1fr_1.6fr]' : ''}`}>
                {/* List */}
                <div className="space-y-3">
                  {evaluations.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => { setSelected(ev); setActiveTab('candidate'); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selected?.id === ev.id
                          ? 'border-violet-400 bg-violet-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {ev.job_title ?? 'Untitled Role'}
                          </p>
                          {ev.company_hint && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.company_hint}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <ScoreBadge score={ev.fit_score} />
                            <span className="text-xs text-slate-400">{timeAgo(ev.created_at)}</span>
                            <span className="text-xs text-slate-400"><DeviceType ua={ev.user_agent} /></span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Detail panel */}
                {selected && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20 self-start">
                    {/* Detail header */}
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{selected.job_title ?? 'Untitled Role'}</p>
                        {selected.company_hint && <p className="text-xs text-slate-500 mt-0.5">{selected.company_hint}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <ScoreBadge score={selected.fit_score} />
                          <span className="text-xs text-slate-400">{new Date(selected.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          IP: {selected.visitor_ip} · <DeviceType ua={selected.user_agent} />
                        </p>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                      {([
                        { key: 'candidate', label: '🧠 Your Prep Notes' },
                        { key: 'recruiter', label: '📊 Recruiter View' },
                        { key: 'jd', label: '📄 Job Description' },
                      ] as const).map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                            activeTab === tab.key
                              ? 'border-violet-500 text-violet-700 bg-violet-50/50'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-5 max-h-[60vh] overflow-y-auto">
                      {activeTab === 'candidate' && (
                        <div>
                          {selected.candidate_notes ? (
                            <div className="prose prose-sm max-w-none text-slate-800
                              prose-headings:text-slate-900 prose-headings:font-semibold
                              prose-h2:text-sm prose-h2:mt-5 prose-h2:mb-2
                              prose-ul:my-2 prose-li:my-1
                              prose-p:text-slate-700 prose-p:leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {selected.candidate_notes}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-sm italic">
                              No candidate notes were generated for this evaluation.
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === 'recruiter' && (
                        <div className="prose prose-sm max-w-none text-slate-800
                          prose-headings:text-slate-900 prose-headings:font-semibold
                          prose-h2:text-sm prose-h2:mt-5 prose-h2:mb-2
                          prose-ul:my-2 prose-li:my-1
                          prose-p:text-slate-700 prose-p:leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selected.recruiter_output}
                          </ReactMarkdown>
                        </div>
                      )}

                      {activeTab === 'jd' && (
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {selected.job_description}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
