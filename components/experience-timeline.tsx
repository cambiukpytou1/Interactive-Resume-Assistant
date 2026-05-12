import { Role } from '@/lib/types';

export function ExperienceTimeline({ roles }: { roles: Role[] }) {
  return (
    <section id="experience" className="space-y-6">
      <div>
        <h2 className="section-title">Experience timeline</h2>
        <p className="section-subtitle">Public-safe experience highlights organized by role, grounded in the approved resume knowledge base.</p>
      </div>
      <div className="space-y-4">
        {roles.map((role) => (
          <article key={role.id} className="panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{role.title}</h3>
                <p className="mt-1 text-sm font-medium text-blue-700">{role.company}</p>
                <p className="mt-1 text-sm text-slate-500">{role.location}</p>
              </div>
              <div className="text-sm font-medium text-slate-500">{role.start_date} — {role.end_date}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{role.summary}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {role.highlights.slice(0, 4).map((highlight) => (
                <li key={highlight} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {highlight}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
