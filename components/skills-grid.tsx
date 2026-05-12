import { Skills } from '@/lib/types';

function formatGroupName(key: string) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SkillsGrid({ skills }: { skills: Skills }) {
  const entries = Object.entries(skills).filter(([key]) => !['explicit_boundaries'].includes(key));

  return (
    <section id="skills" className="space-y-6">
      <div>
        <h2 className="section-title">Skills and positioning</h2>
        <p className="section-subtitle">Grouped capability areas designed for recruiter scanning and retrieval support.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map(([group, value]) => {
          const items = Array.isArray(value) ? value : [];
          return (
            <article key={group} className="panel p-5">
              <h3 className="text-lg font-semibold text-slate-900">{formatGroupName(group)}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {items.map((item: any) => (
                  <span key={typeof item === 'string' ? item : item.name} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                    {typeof item === 'string' ? item : item.name}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
