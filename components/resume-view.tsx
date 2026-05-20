'use client';

import Link from 'next/link';
import { ResumeData } from '@/lib/types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-xl font-semibold text-slate-900">{children}</h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function SkillTag({ name, level }: { name: string; level?: string }) {
  const levelColor =
    level === 'advanced' || level === 'strong'
      ? 'bg-blue-50 border-blue-200 text-blue-800'
      : level === 'working'
      ? 'bg-slate-50 border-slate-200 text-slate-700'
      : 'bg-slate-50 border-slate-200 text-slate-600';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium ${levelColor}`}>
      {name}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (dateStr === 'Present') return 'Present';
  const [year, month] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function groupSkillName(key: string) {
  const map: Record<string, string> = {
    ai_and_workflow: 'AI & Workflow',
    analytics_and_data: 'Analytics & Data',
    integration_and_platforms: 'Integration & Platforms',
    governance_risk_compliance: 'Governance, Risk & Compliance',
    leadership_and_delivery: 'Leadership & Delivery',
    certifications_and_education: 'Certifications & Education',
  };
  return map[key] ?? key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ResumeView({ data }: { data: ResumeData }) {
  const { profile, roles, projects, skills } = data;

  const skillGroups = Object.entries(skills).filter(([key]) => key !== 'explicit_boundaries');
  const certEdu = (skills.certifications_and_education as string[] | undefined) ?? [];
  const skillGroupsWithoutCertEdu = skillGroups.filter(([key]) => key !== 'certifications_and_education');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-slate-700">Resume · I.Y.</span>
          </div>
          <Link
            href="/evaluate"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Job Fit
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with AI
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header Card */}
        <div className="bg-slate-950 text-white rounded-3xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="relative px-8 py-10 md:px-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                {/* Name & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    IY
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                    <p className="text-blue-300 text-sm font-medium">{profile.headline}</p>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mt-4">
                  {profile.medium_public_summary}
                </p>

                {/* Location & Contact */}
                <div className="flex flex-wrap gap-3 mt-5">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact on request
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 md:w-56 flex-shrink-0">
                {[
                  { val: `${profile.experience_summary.total_years_enterprise_experience}`, label: 'Years Enterprise' },
                  { val: `${profile.experience_summary.big_four_years}`, label: 'Years Big Four' },
                  { val: profile.experience_summary.workflow_automation_and_orchestration_years, label: 'Workflow Auto.' },
                  { val: profile.experience_summary.applied_ai_workflow_experience, label: 'Applied AI' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/8 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-white">{s.val}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Positioning Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.current_positioning.map((pos) => (
                <span key={pos} className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-medium">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Best Fit Roles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Best-Fit Roles</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.best_fit_roles.map((role) => (
              <div key={role} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800">{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Professional Experience</SectionTitle>
          <div className="space-y-8">
            {roles.map((role, idx) => (
              <div key={role.id} className={`relative ${idx !== roles.length - 1 ? 'pb-8 border-b border-slate-100' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{role.title}</h3>
                    <p className="text-sm font-medium text-blue-700 mt-0.5">{role.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{role.location}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {formatDate(role.start_date)} – {role.end_date === 'Present' ? 'Present' : formatDate(role.end_date)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{role.summary}</p>
                <ul className="space-y-2">
                  {role.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {h}
                    </li>
                  ))}
                </ul>
                {/* Industries & Tools */}
                {role.industries.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {role.industries.map((ind) => (
                      <span key={ind} className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
                {role.tools_platforms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {role.tools_platforms.map((tool) => (
                      <span key={tool} className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Skills & Capabilities</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
            {skillGroupsWithoutCertEdu.map(([key, value]) => {
              const items = Array.isArray(value) ? value : [];
              return (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{groupSkillName(key)}</h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item: any) => {
                      const name = typeof item === 'string' ? item : item.name;
                      const level = typeof item === 'object' ? item.level : undefined;
                      return <SkillTag key={name} name={name} level={level} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certifications & Education */}
        {certEdu.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionTitle>Certifications & Education</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-3">
              {certEdu.map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Selected Projects</SectionTitle>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                    {project.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                    {project.confidence}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">{project.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{project.summary}</p>
                {project.tools.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tools.map((tool) => (
                      <span key={tool} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-950 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Have questions about I.Y.'s background?</h3>
          <p className="text-slate-400 text-sm mb-6">
            Use the AI assistant to ask specific questions and get grounded answers from the approved knowledge base.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with the Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
