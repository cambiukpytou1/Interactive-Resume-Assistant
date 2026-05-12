import { Profile } from '@/lib/types';

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.32),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="relative grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10 lg:py-12">
        <div>
          <span className="badge border-blue-400/30 bg-blue-500/10 text-blue-100">Interactive Resume</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{profile.name}</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-200">{profile.headline}</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{profile.medium_public_summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
            <span className="rounded-full border border-slate-700 px-3 py-1">{profile.location}</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">{profile.experience_summary.total_years_enterprise_experience} years enterprise experience</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">{profile.experience_summary.workflow_automation_and_orchestration_years} years workflow automation</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">{profile.experience_summary.applied_ai_workflow_experience} applied AI workflow</span>
          </div>
        </div>
        <div className="panel bg-white/5 p-5 text-sm text-slate-100 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Positioning</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
            {profile.current_positioning.map((item) => (
              <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
