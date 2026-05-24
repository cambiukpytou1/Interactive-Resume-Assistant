import Link from 'next/link';
import { loadResumeData } from '@/lib/data';

export default async function LandingPage() {
  const data = await loadResumeData();
  const { profile } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">IY</span>
          </div>
          <span className="text-sm font-semibold text-slate-200">Resume Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            View Resume
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
          >
            Chat with AI
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Interactive Resume · AI-Powered
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              I.Y.
            </span>
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-medium text-slate-300">
            {profile.headline}
          </p>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {profile.medium_public_summary}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/resume"
            className="group flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Resume
          </Link>
          <Link
            href="/chat"
            className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with Assistant
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
          {[
            { value: `${profile.experience_summary.total_years_enterprise_experience} yrs`, label: 'Enterprise Experience' },
            { value: profile.experience_summary.big_four_years + ' yrs', label: 'Big Four Background' },
            { value: profile.experience_summary.workflow_automation_and_orchestration_years, label: 'Workflow Automation' },
            { value: profile.experience_summary.applied_ai_workflow_experience, label: 'Applied AI Workflow' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-20 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: 'Full Resume View',
              description: 'Browse the complete professional profile — experience timeline, skills, projects, and certifications in a beautifully formatted layout.',
              href: '/resume',
              cta: 'View Resume →',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              ),
              title: 'AI Chat Assistant',
              description: 'Ask recruiter-style questions and get grounded, governance-aware answers drawn directly from the approved knowledge base.',
              href: '/chat',
              cta: 'Start Chatting →',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: 'Governance-Aware',
              description: 'Built with privacy-first guardrails. Personal details are protected, public-safe information is surfaced, and restricted claims are blocked.',
              href: '/chat',
              cta: 'Learn More →',
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all backdrop-blur"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{card.description}</p>
              <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                {card.cta}
              </span>
            </Link>
          ))}
        </div>

        {/* Current Positioning Tags */}
        <div className="mt-20 text-center">
          <p className="text-sm text-slate-500 mb-4">Best-fit roles</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.best_fit_roles.map((role) => (
              <span
                key={role}
                className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 text-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500">
            Interactive Resume Assistant · Built with Next.js & AI
          </p>
          <div className="flex items-center gap-6">
            <Link href="/resume" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Resume
            </Link>
            <Link href="/evaluate" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Job Fit
            </Link>
            <Link href="/chat" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              AI Chat
            </Link>
            {/* GitHub QR */}
            <div className="group relative flex items-center gap-2 cursor-pointer">
              <a
                href="https://github.com/cambiukpytou1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              {/* QR tooltip on hover */}
              <div className="absolute bottom-8 right-0 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/github-qr.png" alt="GitHub QR Code" className="w-36 h-36 rounded-lg" />
                  <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">cambiukpytou1</p>
                </div>
                <div className="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 -mt-1" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
