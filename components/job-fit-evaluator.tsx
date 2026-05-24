'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EXAMPLE_JDS = [
  {
    label: 'Director of AI Transformation',
    text: `We are looking for a Director of AI Transformation to lead the integration of artificial intelligence and automation across our enterprise operations. The ideal candidate will have deep experience designing AI-assisted workflows, managing cross-functional teams, and translating complex AI concepts into actionable business strategies.

Key responsibilities:
- Lead enterprise-wide AI and automation strategy and roadmap
- Design and implement AI-assisted workflows and orchestration systems
- Partner with C-suite and business unit leaders to identify automation opportunities
- Oversee governance, risk management, and compliance for AI deployments
- Manage vendor relationships and technology partner ecosystems
- Build and mentor a team of workflow automation and data professionals

Requirements:
- 10+ years of enterprise experience
- Proven track record of delivering AI or automation transformation programs
- Strong understanding of governance, risk, and compliance frameworks
- Experience with enterprise platforms (cloud, ERP, analytics)
- Excellent executive communication and stakeholder management skills`,
  },
  {
    label: 'Head of Data & Analytics',
    text: `We are hiring a Head of Data & Analytics to modernize our data infrastructure and build a world-class analytics capability. You will own the strategy, architecture, and delivery of data products that drive operational and financial decision-making across the organization.

Responsibilities:
- Define and execute enterprise data and analytics strategy
- Lead Snowflake/cloud data warehouse modernization initiatives
- Build self-service Power BI and reporting capabilities for business users
- Establish data governance, quality, and lineage standards
- Oversee a team of data engineers, analysts, and BI developers
- Partner with finance, operations, and technology leadership

Requirements:
- 8+ years in data and analytics leadership
- Hands-on experience with Snowflake, Power BI, or similar modern stack
- Strong background in data governance and controls
- Experience in financial services or regulated industries preferred
- Track record of delivering analytics modernization programs`,
  },
  {
    label: 'Workflow Automation Lead',
    text: `We are seeking a Workflow Automation Lead to drive intelligent process automation across our finance, HR, and operations functions. This role will own the design, build, and governance of automation workflows using modern RPA, integration, and AI-assisted tooling.

Key responsibilities:
- Identify, prioritize, and deliver automation opportunities across business functions
- Design and build workflows using Power Automate, Boomi, or equivalent platforms
- Implement AI-assisted document processing and exception management workflows
- Establish automation governance standards and CoE practices
- Collaborate with IT, operations, and compliance teams
- Track and report automation ROI and performance metrics

Requirements:
- 5+ years of workflow automation or RPA experience
- Hands-on experience with Power Automate, Boomi, UiPath, or similar
- Understanding of ERP integration patterns (Oracle, SAP, NetSuite)
- Experience in regulated industries (financial services, healthcare) preferred
- Strong analytical and process design skills`,
  },
];

type EvalStatus = 'idle' | 'loading' | 'done' | 'error';

function ScoreDisplay({ evaluation }: { evaluation: string }) {
  // Extract score from markdown for the highlight card
  const scoreMatch = evaluation.match(/##\s*Overall Fit Score\s*\n([^\n]+)/i);
  const scoreLine = scoreMatch?.[1]?.trim() ?? '';
  const numMatch = scoreLine.match(/(\d+)\s*(?:\/\s*10|out of 10)?/);
  const score = numMatch ? parseInt(numMatch[1]) : null;

  const scoreColor =
    score === null ? 'text-slate-400'
    : score >= 8 ? 'text-emerald-500'
    : score >= 6 ? 'text-amber-500'
    : 'text-red-500';

  const scoreBg =
    score === null ? 'bg-slate-50 border-slate-200'
    : score >= 8 ? 'bg-emerald-50 border-emerald-200'
    : score >= 6 ? 'bg-amber-50 border-amber-200'
    : 'bg-red-50 border-red-200';

  if (!score) return null;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${scoreBg} mb-6`}>
      <div className="flex-shrink-0 text-center">
        <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-slate-400 text-xl font-medium">/10</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Overall Fit Score</p>
        <p className="text-xs text-slate-500 mt-0.5">{scoreLine.replace(/\d+\s*(?:\/\s*10|out of 10)?\s*[–—-]?\s*/i, '').trim()}</p>
      </div>
    </div>
  );
}

export function JobFitEvaluator() {
  const [jobDescription, setJobDescription] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [status, setStatus] = useState<EvalStatus>('idle');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleInput = (val: string) => {
    setJobDescription(val);
    setCharCount(val.length);
  };

  const loadExample = (text: string) => {
    handleInput(text);
    setStatus('idle');
    setEvaluation('');
    setError('');
  };

  const evaluate = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      setError('Please paste a job description (at least 50 characters).');
      return;
    }
    setStatus('loading');
    setEvaluation('');
    setError('');

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setEvaluation(data.evaluation);
      setStatus('done');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setEvaluation('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">JF</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Job Fit Evaluator</p>
              <p className="text-xs text-slate-500">Paste a JD · Get an AI-powered fit analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/resume"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              Resume
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
            >
              AI Chat
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            AI-Powered Job Fit Analysis
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            How well does I.Y. fit your role?
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Paste a job description below and get a structured evaluation of I.Y.'s fit — including strengths, gaps, differentiators, and interview talking points.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — Input */}
          <div className="space-y-4">
            {/* Example JDs */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_JDS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.text)}
                    className="px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-600">Job Description</span>
                {charCount > 0 && (
                  <span className={`text-xs ${charCount > 4500 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {charCount.toLocaleString()} / 5,000 chars
                  </span>
                )}
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Paste the full job description here — title, responsibilities, requirements, and any other relevant details...

The more detail you provide, the more accurate the evaluation."
                className="w-full h-80 px-4 py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                maxLength={5000}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={evaluate}
              disabled={status === 'loading' || !jobDescription.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-semibold rounded-2xl transition-colors shadow-sm"
            >
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing fit…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Evaluate Job Fit
                </>
              )}
            </button>

            {/* What you get */}
            {status === 'idle' && !evaluation && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">What you'll get</p>
                <ul className="space-y-2.5">
                  {[
                    { icon: '🎯', label: 'Overall Fit Score (1–10)' },
                    { icon: '✅', label: 'Specific strengths matched to JD' },
                    { icon: '⚠️', label: 'Honest gaps and mismatches' },
                    { icon: '⭐', label: 'Standout differentiators' },
                    { icon: '💬', label: 'Interview talking points' },
                    { icon: '📈', label: 'Suggestions to strengthen candidacy' },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span>{item.icon}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — Results */}
          <div>
            {status === 'loading' && (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-12 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">Analyzing job fit…</p>
                  <p className="text-sm text-slate-500 mt-1">The AI is comparing I.Y.'s background against the job description. This usually takes 10–20 seconds.</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['Reviewing experience', 'Matching skills', 'Identifying gaps', 'Generating insights'].map((step, i) => (
                    <div
                      key={step}
                      className="h-1.5 w-12 rounded-full bg-violet-200 overflow-hidden"
                    >
                      <div
                        className="h-full bg-violet-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'done' && evaluation && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">Fit Evaluation Complete</span>
                  </div>
                  <button
                    onClick={reset}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    New evaluation
                  </button>
                </div>

                <div className="p-5 max-h-[calc(100vh-260px)] overflow-y-auto">
                  <ScoreDisplay evaluation={evaluation} />
                  <div className="prose prose-sm max-w-none text-slate-800
                    prose-headings:text-slate-900 prose-headings:font-semibold
                    prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2
                    prose-ul:my-2 prose-li:my-1
                    prose-strong:text-slate-900
                    prose-p:text-slate-700 prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {/* Remove the Overall Fit Score section since we render it above */}
                      {evaluation.replace(/##\s*Overall Fit Score[\s\S]*?(?=##|$)/i, '').trim()}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                  <Link
                    href="/chat"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Ask follow-up questions
                  </Link>
                  <button
                    onClick={reset}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try another JD
                  </button>
                </div>
              </div>
            )}

            {status === 'idle' && !evaluation && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Your evaluation will appear here</p>
                <p className="text-xs text-slate-400">Paste a job description and click "Evaluate Job Fit"</p>
              </div>
            )}

            {status === 'error' && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center bg-red-50 rounded-2xl border border-red-200 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-red-700 mb-1">Evaluation failed</p>
                <p className="text-xs text-red-500 mb-4">{error}</p>
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
