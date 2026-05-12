import { Guardrails, Profile } from '@/lib/types';

export function FitGrid({ profile, guardrails }: { profile: Profile; guardrails: Guardrails }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="panel p-6">
        <h2 className="section-title text-xl">Role fit</h2>
        <p className="section-subtitle max-w-none">How the approved knowledge base positions I.Y. for recruiter and hiring-manager conversations.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {profile.best_fit_roles.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </article>
      <article className="panel p-6">
        <h2 className="section-title text-xl">Guardrail-safe framing</h2>
        <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
          {Object.values(guardrails.fit_statements).map((item) => (
            <p key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
              {item}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
