import { Profile } from '@/lib/types';

export function StatsStrip({ profile }: { profile: Profile }) {
  const stats = [
    { label: 'Enterprise experience', value: `${profile.experience_summary.total_years_enterprise_experience} years` },
    { label: 'Workflow automation', value: `${profile.experience_summary.workflow_automation_and_orchestration_years} years` },
    { label: 'Applied AI workflow', value: profile.experience_summary.applied_ai_workflow_experience },
    { label: 'Big Four background', value: `${profile.experience_summary.big_four_years} years` }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="panel p-5">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}
